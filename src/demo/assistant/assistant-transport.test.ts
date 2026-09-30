import { expect, it } from "vitest"
import { readUIMessageStream } from "ai"
import { initialProjects } from "../project-fixtures"
import { initialActivity } from "../activity-fixtures"
import workspace from "../data/workspace.json"
import {
  assistantReply,
  atRiskProjects,
  matchIntent,
} from "./assistant-answers"
import {
  createScriptedTransport,
  textChunks,
  type AssistantMessage,
  type AssistantRequest,
} from "./assistant-transport"

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
    pace: { firstToken: 0, chunk: 0 },
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

  return { message, error }
}

it("matches prompts to scripted topics and falls back otherwise", () => {
  expect(matchIntent("Which projects are at risk?")).toBe("risk")
  expect(matchIntent("what CHANGED lately")).toBe("week")
  expect(matchIntent("Show me the API")).toBe("api")
  expect(matchIntent("Tell me a joke")).toBeUndefined()
  expect(assistantReply("Tell me a joke", context).followUps).toHaveLength(3)
})

it("flags only open projects that meet the stated risk rule", () => {
  const risks = atRiskProjects(context)

  expect(risks.map((risk) => risk.project.id)).toEqual(["website"])
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

it("streams a reply the AI SDK assembles into text and follow-ups", async () => {
  const { message, error } = await send("What changed this week?")

  expect(error).toBeUndefined()
  expect(message?.parts.map((part) => part.type)).toEqual([
    "step-start",
    "text",
    "data-suggestions",
  ])
  expect(message?.parts[1]).toMatchObject({
    type: "text",
    state: "done",
    text: assistantReply("What changed this week?", context).text,
  })
})

it("fails the first attempt part-way in the failure scenario", async () => {
  const { message, error } = await send("At risk?", "assistant-error")
  const full = assistantReply("At risk?", context).text
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
