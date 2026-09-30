import { expect, it } from "vitest"
import { readUIMessageStream } from "ai"
import { initialProjects } from "../project-fixtures"
import { initialActivity } from "../activity-fixtures"
import workspace from "../data/workspace.json"
import { assistantReply, matchIntent } from "./assistant-answers"
import { textChunks } from "./assistant-chunks"
import { createScriptedTransport } from "./assistant-transport"
import type { AssistantMessage, AssistantRequest } from "./assistant-types"
import { atRiskProjects } from "./risk-answer"

const context = {
  projects: initialProjects,
  activity: initialActivity,
  people: workspace.members,
  referenceDate: workspace.referenceDate,
}

const prompt = (text: string): AssistantMessage => ({
  id: text,
  role: "user",
  parts: [{ type: "text", text }],
})

async function send(
  text: string,
  scenario: AssistantRequest["scenario"] = "normal",
  abortSignal?: AbortSignal,
) {
  const transport = createScriptedTransport({
    reply: assistantReply,
    pace: { firstToken: 0, chunk: 0, work: 0 },
  })

  const stream = await transport.sendMessages({
    trigger: "submit-message",
    chatId: "test",
    messageId: undefined,
    messages: [prompt(text)],
    abortSignal,
    body: { scenario, context } satisfies AssistantRequest,
  })

  let message: AssistantMessage | undefined
  let error: unknown

  try {
    for await (const update of readUIMessageStream<AssistantMessage>({
      stream,
      terminateOnError: true,
    }))
      message = update
  } catch (caught) {
    error = caught
  }

  return { message, error, types: message?.parts.map((part) => part.type) }
}

it("matches prompts to scripted topics and falls back otherwise", () => {
  expect(matchIntent("Which projects are at risk?")).toBe("risk")
  expect(matchIntent("what CHANGED lately")).toBe("week")
  expect(matchIntent("Show me the API")).toBe("api")
  expect(matchIntent("Tell me a joke")).toBeUndefined()
  expect(assistantReply("Tell me a joke", context).followUps).toHaveLength(3)
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
