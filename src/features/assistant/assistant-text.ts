import type { ChatStatus } from "ai"
import type { AssistantMessage } from "@/demo/assistant/assistant-types"

type Part = AssistantMessage["parts"][number]

type ApprovalPart = Extract<Part, { type: "tool-createTasks" }>

const citations = /\[[^\]]*\]\(#source:[^)]*\)/gu

export function messageText(message: AssistantMessage) {
  return message.parts
    .flatMap((part) => (part.type === "text" ? part.text : []))
    .join("\n\n")
}

/** A reply's markdown without citation markers, for the clipboard. */
export function copyText(markdown: string) {
  return markdown.replace(citations, "")
}

/** Reads a markdown reply as plain sentences for a screen reader. */
export function spokenText(markdown: string) {
  return copyText(markdown)
    .replace(/```[\s\S]*?```/gu, " (code example) ")
    .replace(/^\|?\s*-{3}.*$/gmu, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/gu, "$1")
    .replace(/[*_#`|>]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim()
}

/** The latest reply is waiting for the person to answer or decide. */
export function awaitsPerson(message: AssistantMessage | undefined) {
  return !!message?.parts.some(
    (part) =>
      (part.type === "tool-chooseProject" &&
        part.state === "input-available") ||
      (part.type === "tool-createTasks" && part.state === "approval-requested"),
  )
}

/** What the reply is waiting for, in words, for the status announcement. */
export function awaitedDecision(message: AssistantMessage) {
  for (const part of message.parts) {
    if (part.type === "tool-chooseProject" && part.state === "input-available")
      return `The assistant asks: ${part.input.question}`

    if (part.type === "tool-createTasks" && part.state === "approval-requested")
      return `The assistant needs your approval: ${approvalTitle(part)}`
  }

  return ""
}

export function approvalTitle(part: ApprovalPart) {
  const count = part.input?.tasks?.length ?? 0

  return `Add ${count} task${count === 1 ? "" : "s"} to ${part.input?.projectName ?? "the project"}?`
}

/** What the status region says about the conversation's progress. */
export function announcement(
  status: ChatStatus,
  last: AssistantMessage | undefined,
  stopped: boolean,
  error: Error | undefined,
) {
  if (status === "submitted" || status === "streaming")
    return "The assistant is replying."

  if (status === "error")
    return `The reply didn't finish. ${error?.message ?? ""}`

  if (last?.role !== "assistant") return ""

  if (stopped) return "Reply stopped."

  if (awaitsPerson(last)) return awaitedDecision(last)

  return `The assistant replied: ${spokenText(messageText(last))}`
}

/** A markdown draft as plain lines, for places that show text as written. */
export function plainText(markdown: string) {
  return markdown
    .replace(/^(#{1,6}\s+.+)\n\n/gmu, "$1\n")
    .replace(/^#{1,6}\s+/gmu, "")
    .replace(/\*\*([^*]+)\*\*/gu, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/gu, "$1")
}
