import type { AssistantMessage } from "@/demo/assistant/assistant-types"
import { messageText, planProjects } from "./assistant-text"

type Part = AssistantMessage["parts"][number]

export type WorkState =
  "running" | "done" | "failed" | "waiting" | "declined" | "stopped"

/** One thing the assistant did, in the order it happened. */
export interface WorkItem {
  id: string
  /** The reply it belongs to, for scrolling the transcript to it. */
  messageId: string
  kind: "reasoning" | "step" | "tool" | "artifact" | "answer"
  label: string
  detail?: string
  /** The reasoning's text. */
  text?: string
  state: WorkState
}

/** A question and everything the assistant did to answer it. */
export interface WorkTurn {
  id: string
  question: string
  items: WorkItem[]
}

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`

function excerpt(text: string) {
  const plain = text
    .replace(/\[([^\]]*)\]\([^)]*\)/gu, "$1")
    .replace(/[*_`#>]/gu, "")
    .replace(/\s+/gu, " ")
    .trim()

  return plain.length > 90 ? `${plain.slice(0, 88).trimEnd()}…` : plain
}

function partItem(
  part: Part,
  index: number,
  messageId: string,
  stopped: boolean,
): WorkItem | undefined {
  const base = { id: `${messageId}-${index}`, messageId }

  const settled = (running: boolean): WorkState =>
    running ? (stopped ? "stopped" : "running") : "done"

  switch (part.type) {
    case "reasoning":
      return {
        ...base,
        kind: "reasoning",
        label: "Reasoned",
        text: part.text,
        state: settled(part.state === "streaming"),
      }
    case "data-step":
      return {
        ...base,
        kind: "step",
        label: part.data.label,
        detail: part.data.results.join(" · ") || undefined,
        state: settled(part.data.status === "active"),
      }
    case "tool-searchProjects":
      return part.state === "output-error"
        ? {
            ...base,
            kind: "tool",
            label: "Searched projects",
            detail: part.errorText,
            state: "failed",
          }
        : {
            ...base,
            kind: "tool",
            label: "Searched projects",
            detail:
              part.state === "output-available"
                ? plural(part.output.length, "project")
                : undefined,
            state: settled(part.state !== "output-available"),
          }
    case "tool-chooseProject":
      return {
        ...base,
        kind: "tool",
        label: "Asked which project",
        state:
          part.state === "output-available"
            ? "done"
            : stopped
              ? "stopped"
              : "waiting",
      }
    case "tool-createTasks": {
      const input = part.state === "input-streaming" ? undefined : part.input

      const label = input
        ? `Add ${plural(input.tasks.length, "task")} to ${input.projectName}`
        : "Add tasks"

      const state: WorkState =
        part.state === "output-available"
          ? "done"
          : part.state === "output-denied"
            ? "declined"
            : stopped
              ? "stopped"
              : "waiting"

      return {
        ...base,
        kind: "tool",
        label,
        detail: state === "waiting" ? "Waiting for your approval" : undefined,
        state,
      }
    }

    case "tool-applyPlan": {
      const state: WorkState =
        part.state === "output-available"
          ? "done"
          : part.state === "output-denied"
            ? "declined"
            : stopped
              ? "stopped"
              : "waiting"

      return {
        ...base,
        kind: "tool",
        label: `Apply the plan to ${planProjects(part)}`,
        detail: state === "waiting" ? "Waiting for your approval" : undefined,
        state,
      }
    }

    case "tool-showAnswer":
      return {
        ...base,
        kind: "answer",
        label: "Built an answer",
        detail: part.input?.title,
        state: settled(part.state === "input-streaming"),
      }
    case "data-artifact":
      return {
        ...base,
        kind: "artifact",
        label: `Drafted “${part.data.title}”`,
        state: settled(!part.data.complete),
      }
    case "text":
      return part.text.trim()
        ? {
            ...base,
            kind: "answer",
            label: "Answered",
            detail: excerpt(part.text),
            state: settled(part.state === "streaming"),
          }
        : undefined
    default:
      return undefined
  }
}

/** Each question with the work done to answer it, oldest first. */
export function workTurns(messages: AssistantMessage[], stopped: string[]) {
  const turns: WorkTurn[] = []

  for (const message of messages) {
    if (message.role === "user") {
      turns.push({
        id: message.id,
        question: messageText(message) || "Attachments",
        items: [],
      })

      continue
    }

    const turn = turns.at(-1)

    if (!turn) continue

    message.parts.forEach((part, index) => {
      const item = partItem(
        part,
        index,
        message.id,
        stopped.includes(message.id),
      )

      if (item) turn.items.push(item)
    })
  }

  return turns
}
