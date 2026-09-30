import { beforeEach, expect, it } from "vitest"
import { readUIMessageStream } from "ai"
import { initialProjects } from "../project-fixtures"
import { initialActivity } from "../activity-fixtures"
import workspace from "../data/workspace.json"
import { assistantReply, matchIntent } from "./assistant-answers"
import { textChunks } from "./assistant-chunks"
import { createScriptedTransport } from "./assistant-transport"
import type {
  AssistantMessage,
  AssistantRequest,
  CreateTasksInput,
} from "./assistant-types"
import { continueChecklist } from "./checklist-answer"
import { atRiskProjects } from "./risk-answer"

const context = {
  projects: initialProjects,
  activity: initialActivity,
  people: workspace.members,
  referenceDate: workspace.referenceDate,
}

const created: CreateTasksInput[] = []

beforeEach(() => {
  created.length = 0
})

const prompt = (text: string): AssistantMessage => ({
  id: text,
  role: "user",
  parts: [{ type: "text", text }],
})

/** Streams a reply to the messages; an assistant message last continues it. */
async function run(
  messages: AssistantMessage[],
  scenario: AssistantRequest["scenario"] = "normal",
  abortSignal?: AbortSignal,
) {
  const transport = createScriptedTransport({
    reply: assistantReply,
    resume: continueChecklist,
    pace: { firstToken: 0, chunk: 0, work: 0 },
  })

  const stream = await transport.sendMessages({
    trigger: "submit-message",
    chatId: "test",
    messageId: undefined,
    messages,
    abortSignal,
    body: {
      scenario,
      model: "balanced",
      context,
      actions: { createTasks: (input) => void created.push(input) },
    } satisfies AssistantRequest,
  })

  const last = messages[messages.length - 1]
  let message: AssistantMessage | undefined
  let error: unknown

  try {
    for await (const update of readUIMessageStream<AssistantMessage>({
      message: last.role === "assistant" ? structuredClone(last) : undefined,
      stream,
      terminateOnError: true,
    }))
      message = update
  } catch (caught) {
    error = caught
  }

  return { message, error, types: message?.parts.map((part) => part.type) }
}

const send = (
  text: string,
  scenario?: AssistantRequest["scenario"],
  abortSignal?: AbortSignal,
) => run([prompt(text)], scenario, abortSignal)

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
  expect(types?.slice(0, 5)).toEqual([
    "step-start",
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

  const answered: AssistantMessage = {
    ...message,
    parts: message.parts.map((part) =>
      part.type === "tool-chooseProject" && part.state === "input-available"
        ? {
            ...part,
            state: "output-available",
            output: { projectId: "mobile" },
          }
        : part,
    ),
  }

  const { message: after } = await run([user, answered])

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
