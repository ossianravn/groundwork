import { answerNodeList } from "@/kit/answer/answer-library"
import { answerHeadingProps } from "@/kit/answer/answer-schemas"
import { inWords } from "@/demo/assistant/answer-format"
import type { AssistantMessage } from "@/demo/assistant/assistant-types"
import { sourceMetadata } from "@/demo/assistant/assistant-types"
import { shareText } from "./assistant-text"

type Part = AssistantMessage["parts"][number]

/** Something the conversation produced or changed. */
export interface WorkOutput {
  id: string
  messageId: string
  kind: "answer" | "draft" | "tasks"
  title: string
  detail: string
  /** Where it stands; a finished answer needs no label. */
  state?:
    | "writing"
    | "draft"
    | "posted"
    | "waiting"
    | "added"
    | "applied"
    | "declined"
  /** The draft's markdown. */
  markdown?: string
  /** The pages it changed, once it did. */
  links?: { url: string; label: string }[]
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

/** A change awaiting approval, then done or declined. */
const decided = (state: string, done: "added" | "applied") =>
  state === "output-available"
    ? done
    : state === "output-denied"
      ? "declined"
      : "waiting"

/** What a part of a reply produced or changed, if anything. */
function outputOf(
  part: Part,
  messageId: string,
  posted: string[],
): WorkOutput | undefined {
  const base = { messageId }

  switch (part.type) {
    case "tool-showAnswer": {
      const nodes = answerNodeList.parse(part.input?.nodes)
      const heading = nodes.find((node) => node.type === "Heading")
      const result = answerHeadingProps.safeParse(heading?.props)

      return part.input?.title
        ? {
            ...base,
            id: part.toolCallId,
            kind: "answer",
            title: part.input.title,
            detail: result.success ? result.data.text : "",
            state: part.state === "input-streaming" ? "writing" : undefined,
          }
        : undefined
    }

    case "data-artifact": {
      const { data } = part
      const done = !!part.id && posted.includes(part.id)

      return part.id
        ? {
            ...base,
            id: part.id,
            kind: "draft",
            title: data.title,
            detail: data.projectName,
            state: !data.complete ? "writing" : done ? "posted" : "draft",
            markdown: data.content,
            links: done
              ? [{ url: data.url, label: `Open ${data.projectName}` }]
              : undefined,
          }
        : undefined
    }

    case "tool-createTasks": {
      const input = part.state === "input-streaming" ? undefined : part.input

      if (!input) return undefined

      return {
        ...base,
        id: part.toolCallId,
        kind: "tasks",
        title: `${plural(input.tasks.length, "task")} for ${input.projectName}`,
        detail: input.tasks.map((task) => task.title).join(", "),
        state: decided(part.state, "added"),
        links:
          part.state === "output-available"
            ? [{ url: part.output.url, label: `Open ${input.projectName}` }]
            : undefined,
      }
    }

    case "tool-applyPlan": {
      const input = part.state === "input-streaming" ? undefined : part.input

      if (!input) return undefined

      const { moves, deferred, projects } = input

      return {
        ...base,
        id: part.toolCallId,
        kind: "tasks",
        title: `${plural(moves.length + deferred.length, "change")} to ${inWords(projects.map((project) => project.name))}`,
        detail: [
          moves.length ? `Reassign ${moves.length}: ${shareText(moves)}` : "",
          deferred.length ? `defer ${deferred.length}` : "",
        ]
          .filter((item) => item !== "")
          .join(" · "),
        state: decided(part.state, "applied"),
        links:
          part.state === "output-available"
            ? part.output.projects.map((project) => ({
                url: project.url,
                label: `Open ${project.name}`,
              }))
            : undefined,
      }
    }

    default:
      return undefined
  }
}

/** Answers, drafts and changes to records, newest first. */
export function workOutputs(messages: AssistantMessage[], posted: string[]) {
  return messages
    .flatMap((message) =>
      message.parts.flatMap((part) => {
        const output = outputOf(part, message.id, posted)

        return output ? [output] : []
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
