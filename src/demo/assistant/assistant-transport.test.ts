import { beforeEach, expect, it } from "vitest"
import { initialProjects } from "../project-fixtures"
import { assistantReply, matchIntent } from "./assistant-answers"
import { textChunks } from "./assistant-chunks"
import type { AssistantMessage } from "./assistant-types"
import { atRiskProjects } from "./risk-answer"
import {
  answered,
  context,
  created,
  prompt,
  run,
  send,
} from "./transport-test-support"

beforeEach(() => {
  created.length = 0
})

it("matches prompts to scripted topics and falls back otherwise", () => {
  expect(matchIntent("Which projects are at risk?")).toBe("risk")
  expect(matchIntent("what CHANGED lately")).toBe("week")
  expect(matchIntent("Show me the API")).toBe("api")
  expect(matchIntent("Tell me a joke")).toBeUndefined()
  expect(assistantReply("Tell me a joke", context).followUps).toHaveLength(4)
})

it("flags only open projects that meet the stated risk rule", () => {
  expect(atRiskProjects(context).map((risk) => risk.project.id)).toEqual([
    "website",
  ])
  expect(
    atRiskProjects({
      ...context,
      projects: initialProjects.map((project) => ({
        ...project,
        completedTasks: project.tasks,
      })),
    }),
  ).toEqual([])
})

it("answers from the records sent with the request", () => {
  const renamed = initialProjects.map((project) =>
    project.id === "website" ? { ...project, name: "Site relaunch" } : project,
  )

  expect(
    assistantReply("at risk?", { ...context, projects: renamed }).text,
  ).toContain("[Site relaunch](/app/demo/projects/website)")
})

it("keeps every character when splitting text into chunks", () => {
  const text = "Line one\n\n```ts\nconst a = 1\n```\n| a | b |"

  expect(textChunks(text).join("")).toBe(text)
})

it("reasons, searches, then answers with citations to every source", async () => {
  const { message, error, types } = await send("Which projects are at risk?")

  expect(error).toBeUndefined()
  expect(types?.slice(0, 6)).toEqual([
    "step-start",
    "data-todo",
    "reasoning",
    "tool-searchProjects",
    "step-start",
    "text",
  ])

  const tool = message?.parts.find(
    (part) => part.type === "tool-searchProjects",
  )

  expect(tool).toMatchObject({ state: "output-available" })
  expect(tool?.state === "output-available" && tool.output).toHaveLength(4)

  const sources = message?.parts.flatMap((part) =>
    part.type === "source-url" ? part.sourceId : [],
  )

  const text = message?.parts.find((part) => part.type === "text")
  const cited = text?.type === "text" ? text.text.match(/#source:[^)]+/gu) : []

  expect(cited?.flatMap((link) => link.slice(8).split(",")).sort()).toEqual(
    sources?.sort(),
  )
})

it("reports progress steps, replacing each by id as it completes", async () => {
  const { message, types } = await send("What changed this week?")

  expect(types).toEqual([
    "step-start",
    "data-todo",
    "data-step",
    "data-step",
    "data-step",
    "text",
    "source-url",
    "data-suggestions",
  ])
  expect(
    message?.parts.flatMap((part) =>
      part.type === "data-step" ? part.data.status : [],
    ),
  ).toEqual(["complete", "complete", "complete"])
})

it("fails the project search once in the tool-error scenario", async () => {
  const { message, types } = await send("At risk?", "tool-error")

  expect(types).not.toContain("source-url")
  expect(
    message?.parts.find((part) => part.type === "tool-searchProjects"),
  ).toMatchObject({ state: "output-error" })
})

it("fails the first attempt part-way in the failure scenario", async () => {
  const { message, error } = await send(
    "How do I use the API?",
    "assistant-error",
  )

  const full = assistantReply("How do I use the API?", context).text
  const text = message?.parts.find((part) => part.type === "text")

  expect(error).toBeInstanceOf(Error)
  expect(text?.type === "text" && text.text.length).toBeLessThan(full.length)
})

it("ends with an AbortError when the request is stopped", async () => {
  const controller = new AbortController()

  controller.abort()

  const { error } = await send("At risk?", "normal", controller.signal)

  expect(error).toMatchObject({ name: "AbortError" })
})

it("asks which project before planning a checklist", async () => {
  const { message, types } = await send("Add a launch checklist to a project")

  const question = message?.parts.find(
    (part) => part.type === "tool-chooseProject",
  )

  expect(question).toMatchObject({ state: "input-available" })
  expect(types).not.toContain("data-suggestions")
  expect(
    question?.type === "tool-chooseProject" &&
      question.input?.options?.map((option) => option?.value),
  ).toEqual(["brand", "website", "mobile", "design-system"])
})

it("plans from the answer, then waits for approval", async () => {
  const user = prompt("Add a launch checklist to a project")
  const { message } = await run([user])

  if (!message) throw new Error("No reply")

  const { message: after } = await run([user, answered(message, "mobile")])

  expect(after?.parts.find((part) => part.type === "data-plan")).toMatchObject({
    data: { title: "Launch checklist for Mobile app", complete: true },
  })
  expect(
    after?.parts.find((part) => part.type === "tool-createTasks"),
  ).toMatchObject({ state: "approval-requested" })
  expect(created).toEqual([])
})

async function decide(approved: boolean) {
  const user = prompt("Add a launch checklist to Mobile app")
  const { message } = await run([user])

  if (!message) throw new Error("No reply")

  const decided: AssistantMessage = {
    ...message,
    parts: message.parts.map((part) =>
      part.type === "tool-createTasks" && part.state === "approval-requested"
        ? {
            ...part,
            state: "approval-responded",
            approval: { id: part.approval.id, approved },
          }
        : part,
    ),
  }

  return run([user, decided])
}

it("adds the tasks only once the person approves", async () => {
  const { message } = await decide(true)

  expect(
    message?.parts.find((part) => part.type === "tool-createTasks"),
  ).toMatchObject({ state: "output-available", output: { added: 5 } })
  expect(created.map((input) => input.projectId)).toEqual(["mobile"])
  expect(created[0].tasks.filter((task) => task.assigneeId)).toHaveLength(2)
})

it("records a denial without changing anything", async () => {
  const { message } = await decide(false)

  expect(
    message?.parts.find((part) => part.type === "tool-createTasks"),
  ).toMatchObject({ state: "output-denied" })
  expect(created).toEqual([])
})
