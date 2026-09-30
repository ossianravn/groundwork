import type { PromptSubmission } from "@/kit/ai/prompt-input"
import { readAsDataUrl } from "@/kit/ai/use-prompt-attachments"
import { conversationCost, modelOf } from "@/demo/assistant/assistant-model"
import type {
  AssistantMessage,
  ModelId,
} from "@/demo/assistant/assistant-types"

export const modelIds: ModelId[] = ["fast", "balanced", "thorough"]

/** The message parts for a submission: files, attached projects, then text. */
export async function messageParts({
  text,
  files,
  references,
}: PromptSubmission) {
  const fileParts = await Promise.all(
    files.map(async (file) => ({
      type: "file" as const,
      mediaType: file.type,
      filename: file.name,
      url: await readAsDataUrl(file),
    })),
  )

  const parts: AssistantMessage["parts"] = [
    ...fileParts,
    ...references.map(({ value, label }) => ({
      type: "data-project" as const,
      data: { id: value, name: label },
    })),
  ]

  return text ? [...parts, { type: "text" as const, text }] : parts
}

/** The latest reply's reported usage against the chosen model's window. */
export function contextUsage(messages: AssistantMessage[], model: ModelId) {
  const meta = [...messages]
    .reverse()
    .find((message) => message.metadata)?.metadata

  if (!meta) return undefined

  return {
    used: meta.usage.input + meta.usage.output,
    max: modelOf(model).contextWindow,
    input: meta.usage.input,
    output: meta.usage.output,
    cost: conversationCost(messages),
  }
}
