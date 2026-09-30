import script from "../data/assistant.json"
import type {
  AssistantChunk,
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

export const defaultPace: Pace = { firstToken: 700, chunk: 28, work: 650 }

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

/**
 * The chunks a scripted reply streams, in AI SDK UI message stream order:
 * reasoning, progress steps, a tool call, the text, its sources and
 * follow-ups. `fail` cuts the text a third of the way in with an error.
 */
export function replyChunks(
  reply: AssistantReply,
  fail: boolean,
  pace: Pace,
): TimedChunk[] {
  const text = textChunks(reply.text)
  const sent = fail ? text.slice(0, Math.ceil(text.length / 3)) : text

  const opening = [
    at(pace.firstToken)({ type: "start" }),
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
    at(0)({ type: "finish", finishReason: "stop" }),
  ]
}
