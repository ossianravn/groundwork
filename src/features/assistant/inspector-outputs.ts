import type { AssistantMessage } from "@/demo/assistant/assistant-types"
import { sourceMetadata } from "@/demo/assistant/assistant-types"

/** Something the conversation produced or changed. */
export interface WorkOutput {
  id: string
  messageId: string
  kind: "draft" | "tasks"
  title: string
  detail: string
  state: "writing" | "draft" | "posted" | "waiting" | "added" | "declined"
  /** The draft's markdown. */
  markdown?: string
  /** The project page, once it changed. */
  url?: string
}

export interface WorkSource {
  url: string
  title: string
  description?: string
  /** How many replies cited it. */
  count: number
}

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`

/** Drafts and task changes, newest first. */
export function workOutputs(messages: AssistantMessage[], posted: string[]) {
  return messages
    .flatMap((message) =>
      message.parts.flatMap((part): WorkOutput[] => {
        if (part.type === "data-artifact" && part.id) {
          const { data } = part

          return [
            {
              id: part.id,
              messageId: message.id,
              kind: "draft",
              title: data.title,
              detail: data.projectName,
              state: !data.complete
                ? "writing"
                : posted.includes(part.id)
                  ? "posted"
                  : "draft",
              markdown: data.content,
              url: posted.includes(part.id) ? data.url : undefined,
            },
          ]
        }

        const input =
          part.type === "tool-createTasks" && part.state !== "input-streaming"
            ? part.input
            : undefined

        if (part.type === "tool-createTasks" && input) {
          const state =
            part.state === "output-available"
              ? "added"
              : part.state === "output-denied"
                ? "declined"
                : "waiting"

          return [
            {
              id: part.toolCallId,
              messageId: message.id,
              kind: "tasks",
              title: `${plural(input.tasks.length, "task")} for ${input.projectName}`,
              detail: input.tasks.map((task) => task.title).join(", "),
              state,
              url:
                part.state === "output-available" ? part.output.url : undefined,
            },
          ]
        }

        return []
      }),
    )
    .reverse()
}

/** Every page the replies cited, once each, most cited first. */
export function workSources(messages: AssistantMessage[]) {
  const sources = new Map<string, WorkSource>()

  for (const message of messages)
    for (const part of message.parts) {
      if (part.type !== "source-url") continue

      const known = sources.get(part.url)
      const metadata = sourceMetadata.safeParse(part.providerMetadata)

      sources.set(part.url, {
        url: part.url,
        title: part.title ?? part.url,
        description: metadata.success
          ? metadata.data.tandem.description
          : undefined,
        count: (known?.count ?? 0) + 1,
      })
    }

  return [...sources.values()].sort((a, b) => b.count - a.count)
}
