import { readUIMessageStream } from "ai"
import { initialProjects } from "../project-fixtures"
import { initialActivity } from "../activity-fixtures"
import { initialTasks } from "../project-tasks"
import { initialFiles } from "../project-files"
import workspace from "../data/workspace.json"
import { assistantReply } from "./assistant-answers"
import { createScriptedTransport } from "./assistant-transport"
import type {
  AnswerActionData,
  ApplyPlanInput,
  AnswerStates,
  AssistantMessage,
  AssistantRequest,
  CreateTasksInput,
} from "./assistant-types"
import { continueTurn } from "./continue-turn"

// Shared by the transport tests: the fixture records, and a way to stream
// a reply at full speed and read the message it builds.

export const context = {
  projects: initialProjects,
  tasks: initialTasks,
  activity: initialActivity,
  people: workspace.members,
  files: initialFiles,
  referenceDate: workspace.referenceDate,
}

/** What createTasks added and applyPlan applied; clear before each test. */
export const created: CreateTasksInput[] = []

export const applied: ApplyPlanInput[] = []

export const prompt = (text: string): AssistantMessage => ({
  id: text,
  role: "user",
  parts: [{ type: "text", text }],
})

/** Streams a reply to the messages; an assistant message last continues it. */
export async function run(
  messages: AssistantMessage[],
  scenario: AssistantRequest["scenario"] = "normal",
  abortSignal?: AbortSignal,
  answers: AnswerStates = {},
) {
  const transport = createScriptedTransport({
    reply: assistantReply,
    resume: continueTurn,
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
      tools: { searchProjects: true, createTasks: true, draftUpdates: true },
      context,
      actions: {
        createTasks: (input) => void created.push(input),
        applyPlan: (input) => void applied.push(input),
      },
      answers,
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

export const send = (
  text: string,
  scenario?: AssistantRequest["scenario"],
  abortSignal?: AbortSignal,
) => run([prompt(text)], scenario, abortSignal)

/** The answer a reply built, once it is complete. */
export function answerOf(message: AssistantMessage | undefined) {
  const part = message?.parts.find((item) => item.type === "tool-showAnswer")

  return part?.type === "tool-showAnswer" && part.state === "output-available"
    ? { toolCallId: part.toolCallId, input: part.input }
    : undefined
}

/** A message sent from inside an answer: its words, with the values. */
export const acting = (
  text: string,
  data: AnswerActionData,
): AssistantMessage => ({
  id: text,
  role: "user",
  parts: [
    { type: "text", text },
    { type: "data-action", data },
  ],
})

/** The reply asking to apply a plan, with the person's decision on it. */
export function decided(
  request: AssistantMessage | undefined,
  approved: boolean,
): AssistantMessage {
  const call = request?.parts.find((part) => part.type === "tool-applyPlan")

  if (!request || call?.type !== "tool-applyPlan" || !("approval" in call))
    throw new Error("No approval")

  return {
    ...request,
    parts: request.parts.map((part) =>
      part.type === "tool-applyPlan" && part.state === "approval-requested"
        ? {
            ...part,
            state: "approval-responded",
            approval: { id: part.approval.id, approved },
          }
        : part,
    ),
  }
}

/** The reply with its question answered: the project chosen. */
export function answered(
  message: AssistantMessage,
  projectId: string,
): AssistantMessage {
  return {
    ...message,
    parts: message.parts.map((part) =>
      part.type === "tool-chooseProject" && part.state === "input-available"
        ? { ...part, state: "output-available", output: { projectId } }
        : part,
    ),
  }
}
