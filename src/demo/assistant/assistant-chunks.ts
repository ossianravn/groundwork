import script from "../data/assistant.json"
import type {
  AssistantChunk,
  AssistantMetadata,
  AssistantReply,
  SourceMetadata,
} from "./assistant-types"

export interface Pace {
  /** Delay before the first chunk, while the reply is "submitted". */
  firstToken: number
  /** Delay between chunks of a few words. */
  chunk: number
  /** How long a step or tool call takes to finish. */
  work: number
}

/** A chunk and how long to wait before sending it. */
export interface TimedChunk {
  chunk: AssistantChunk
  delay: number
}

/** Splits text into chunks of about three words, keeping every character. */
export function textChunks(text: string) {
  const words = text.match(/\s*\S+\s*/gu) ?? []
  const chunks: string[] = []

  for (let index = 0; index < words.length; index += 3)
    chunks.push(words.slice(index, index + 3).join(""))

  return chunks
}

const at = (delay: number) => (chunk: AssistantChunk) => ({ chunk, delay })

function reasoningChunks(text: string, pace: Pace) {
  return [
    at(0)({ type: "reasoning-start", id: "reasoning" }),
    ...textChunks(text).map((delta) =>
      // Reasoning streams at half speed, so there is time to see it.
      at(pace.chunk * 2)({ type: "reasoning-delta", id: "reasoning", delta }),
    ),
    at(0)({ type: "reasoning-end", id: "reasoning" }),
  ]
}

function stepChunks(steps: NonNullable<AssistantReply["steps"]>, pace: Pace) {
  // Each step is sent as active, then replaced (same id) once it completes.
  return steps.flatMap(({ id, label, results }) => [
    at(pace.chunk)({
      type: "data-step",
      id,
      data: { label, status: "active", results: [] },
    }),
    at(pace.work)({
      type: "data-step",
      id,
      data: { label, status: "complete", results },
    }),
  ])
}

function toolChunks(tool: NonNullable<AssistantReply["tool"]>, pace: Pace) {
  const toolCallId = "call-search"
  const input = JSON.stringify(tool.input)

  return [
    at(0)({ type: "tool-input-start", toolCallId, toolName: tool.name }),
    ...textChunks(input.replace(/,/gu, ", ")).map((inputTextDelta) =>
      at(pace.chunk)({ type: "tool-input-delta", toolCallId, inputTextDelta }),
    ),
    at(0)({
      type: "tool-input-available",
      toolCallId,
      toolName: tool.name,
      input: tool.input,
    }),
    at(pace.work)(
      tool.errorText
        ? { type: "tool-output-error", toolCallId, errorText: tool.errorText }
        : { type: "tool-output-available", toolCallId, output: tool.output },
    ),
    // The model's next step reads the result and writes the answer.
    at(0)({ type: "finish-step" }),
    at(0)({ type: "start-step" }),
  ]
}

/** A question the page answers: a client tool call left without output. */
function questionChunks(
  input: NonNullable<AssistantReply["question"]>,
  turn: string,
) {
  const toolCallId = `ask-${turn}`

  return [
    at(0)({ type: "tool-input-start", toolCallId, toolName: "chooseProject" }),
    at(0)({
      type: "tool-input-available",
      toolCallId,
      toolName: "chooseProject",
      input,
    }),
  ]
}

/** The plan streams task by task, then createTasks asks for approval. */
function planChunks(reply: AssistantReply, turn: string, pace: Pace) {
  const { plan, approval } = reply

  if (!plan || !approval) return []

  const toolCallId = `create-${turn}`

  return [
    ...plan.tasks.map((_, index) =>
      at(pace.work / 2)({
        type: "data-plan",
        id: "plan",
        data: {
          ...plan,
          tasks: plan.tasks.slice(0, index + 1),
          complete: false,
        },
      }),
    ),
    at(pace.chunk)({ type: "data-plan", id: "plan", data: plan }),
    at(0)({ type: "tool-input-start", toolCallId, toolName: "createTasks" }),
    at(0)({
      type: "tool-input-available",
      toolCallId,
      toolName: "createTasks",
      input: approval,
    }),
    at(pace.chunk)({
      type: "tool-approval-request",
      approvalId: `approve-${turn}`,
      toolCallId,
    }),
  ]
}

/** The outcome of last turn's approval, which opens the continuation. */
function resolutionChunks(
  resolution: NonNullable<AssistantReply["resolution"]>,
  pace: Pace,
) {
  const { toolCallId } = resolution

  return [
    at(pace.work)(
      "denied" in resolution
        ? { type: "tool-output-denied", toolCallId }
        : {
            type: "tool-output-available",
            toolCallId,
            output: resolution.output,
          },
    ),
    at(0)({ type: "finish-step" }),
  ]
}

/**
 * The chunks a scripted reply streams, in AI SDK UI message stream order:
 * the outcome of an approval, reasoning, progress steps, a tool call, the
 * text, then a question or a plan awaiting approval, sources and
 * follow-ups. `fail` cuts the text a third of the way in with an error.
 * `turn` keeps tool call ids unique within the conversation.
 */
export function replyChunks(
  reply: AssistantReply,
  fail: boolean,
  pace: Pace,
  turn = "turn",
  metadata?: AssistantMetadata,
): TimedChunk[] {
  const text = textChunks(reply.text)
  const sent = fail ? text.slice(0, Math.ceil(text.length / 3)) : text

  const opening = [
    at(pace.firstToken)({ type: "start" }),
    ...(reply.resolution ? resolutionChunks(reply.resolution, pace) : []),
    at(0)({ type: "start-step" }),
    ...(reply.reasoning ? reasoningChunks(reply.reasoning, pace) : []),
    ...(reply.steps ? stepChunks(reply.steps, pace) : []),
    ...(reply.tool ? toolChunks(reply.tool, pace) : []),
    at(0)({ type: "text-start", id: "text" }),
    ...sent.map((delta) =>
      at(pace.chunk)({ type: "text-delta", id: "text", delta }),
    ),
  ]

  if (fail)
    return [...opening, at(0)({ type: "error", errorText: script.failure })]

  return [
    ...opening,
    at(0)({ type: "text-end", id: "text" }),
    ...(reply.question ? questionChunks(reply.question, turn) : []),
    ...planChunks(reply, turn, pace),
    ...(reply.sources ?? []).map((source) =>
      at(0)({
        type: "source-url",
        sourceId: source.id,
        url: source.url,
        title: source.title,
        providerMetadata: {
          tandem: { description: source.description },
        } satisfies SourceMetadata,
      }),
    ),
    ...(reply.followUps.length
      ? [
          at(0)({
            type: "data-suggestions",
            id: "suggestions",
            data: reply.followUps,
          }),
        ]
      : []),
    at(0)({ type: "finish-step" }),
    at(0)({ type: "finish", finishReason: "stop", messageMetadata: metadata }),
  ]
}
