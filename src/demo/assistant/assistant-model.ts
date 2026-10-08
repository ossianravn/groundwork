import script from "../data/assistant.json"
import type { Pace } from "./assistant-chunks"
import type {
  AssistantMessage,
  AssistantMetadata,
  AssistantReply,
  ModelId,
} from "./assistant-types"

export const models = script.models

export const defaultModel: ModelId = "balanced"

export function modelOf(id: ModelId) {
  return models.find((model) => model.id === id) ?? models[1]
}

/** How the chosen model behaves here: its pace, and Fast skips reasoning. */
export function replyForModel(reply: AssistantReply, id: ModelId) {
  return id === "fast" ? { ...reply, reasoning: undefined } : reply
}

export function modelPace(id: ModelId): Pace {
  return modelOf(id).pace
}

/** The person's words plus the names of any projects they attached. */
export function promptOf(message: AssistantMessage | undefined) {
  return (
    message?.parts
      .map((part) =>
        part.type === "text"
          ? part.text
          : part.type === "data-project"
            ? part.data.name
            : "",
      )
      .join(" ") ?? ""
  )
}

/** Names of the files attached to a message. */
export function filesOf(message: AssistantMessage | undefined) {
  return (
    message?.parts.flatMap((part) =>
      part.type === "file" ? (part.filename ?? "a file") : [],
    ) ?? []
  )
}

const tokens = (text: string) => Math.ceil(text.length / 4)

function textOf(message: AssistantMessage) {
  return message.parts
    .map((part) =>
      part.type === "text" || part.type === "reasoning"
        ? part.text
        : part.type === "tool-showAnswer"
          ? JSON.stringify(part.input ?? {})
          : "",
    )
    .join(" ")
}

/**
 * An estimate of the tokens a real model would have used: the conversation
 * so far (plus a fixed system prompt) in, the reply out. It is reported in
 * the finish chunk's metadata, as a server reports usage.
 */
export function estimateUsage(
  messages: AssistantMessage[],
  reply: AssistantReply,
  model: ModelId,
): AssistantMetadata {
  const input =
    420 + messages.reduce((sum, message) => sum + tokens(textOf(message)), 0)

  const output = tokens(
    `${reply.reasoning ?? ""} ${reply.text} ${reply.answer ? JSON.stringify(reply.answer) : ""}`,
  )

  return { model, usage: { input, output } }
}

/** The conversation's estimated cost so far, in dollars. */
export function conversationCost(messages: AssistantMessage[]) {
  return messages.reduce((sum, message) => {
    const meta = message.metadata

    if (!meta) return sum

    const { price } = modelOf(meta.model)

    return (
      sum +
      (meta.usage.input * price.input + meta.usage.output * price.output) /
        1_000_000
    )
  }, 0)
}
