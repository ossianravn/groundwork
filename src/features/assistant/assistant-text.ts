import type { AssistantMessage } from "@/demo/assistant/assistant-transport"

export function messageText(message: AssistantMessage) {
  return message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("\n\n")
}

/** Reads a markdown reply as plain sentences for a screen reader. */
export function spokenText(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/gu, " (code example) ")
    .replace(/^\|?\s*-{3}.*$/gmu, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/gu, "$1")
    .replace(/[*_#`|>]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim()
}
