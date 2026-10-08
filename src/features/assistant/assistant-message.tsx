import type { ReactNode } from "react"
import { RefreshCcw } from "lucide-react"
import { Bubble, BubbleContent } from "@/kit/ui/bubble"
import { Message, MessageContent, MessageFooter } from "@/kit/ui/message"
import {
  MessageAction,
  MessageActions,
  MessageCopyAction,
} from "@/kit/ai/message-actions"
import { Attachment, Attachments } from "@/kit/ai/attachments"
import { InlineCitation } from "@/kit/ai/inline-citation"
import {
  ResponseLinkContext,
  type RenderResponseLink,
} from "@/kit/ai/response-link"
import { Sources, type SourceItem } from "@/kit/ai/sources"
import { Suggestion, Suggestions } from "@/kit/ai/suggestion"
import {
  sourceMetadata,
  type AssistantMessage,
} from "@/demo/assistant/assistant-types"
import { copyText, messageText } from "./assistant-text"
import { ReplyPart } from "./reply-part"

type Part = AssistantMessage["parts"][number]

/** A stable key for a part: its tool call where it has one. */
const partKey = (part: Part, index: number) =>
  "toolCallId" in part ? part.toolCallId : `${part.type}-${index}`

/** Files and projects the person attached, above their words. */
function SentAttachments({ message }: { message: AssistantMessage }) {
  const items = message.parts.flatMap((part, index) =>
    part.type === "file"
      ? {
          id: `${index}`,
          name: part.filename ?? "Attachment",
          mediaType: part.mediaType,
          url: part.url,
        }
      : part.type === "data-project"
        ? { id: `${index}`, name: part.data.name, detail: "Project" }
        : [],
  )

  if (!items.length) return null

  return (
    <Attachments aria-label="You attached" className="justify-end">
      {items.map((item) => (
        <Attachment key={item.id} item={item} />
      ))}
    </Attachments>
  )
}

function sourceItems(parts: Part[]): (SourceItem & { id: string })[] {
  return parts.flatMap((part) => {
    if (part.type !== "source-url") return []

    const metadata = sourceMetadata.safeParse(part.providerMetadata)

    return {
      id: part.sourceId,
      href: part.url,
      title: part.title ?? part.url,
      description: metadata.success
        ? metadata.data.tandem.description
        : undefined,
    }
  })
}

/** Source numbers as a range when they run on (2–4), otherwise a list. */
function citationLabel(all: SourceItem[], cited: SourceItem[]) {
  const numbers = cited.map((source) => all.indexOf(source) + 1)
  const first = numbers[0]
  const last = numbers[numbers.length - 1]

  return numbers.length > 1 && last - first === numbers.length - 1
    ? `${first}–${last}`
    : numbers.join(", ")
}

/**
 * Citations are links to `#source:<id>[,<id>]`. Until the sources arrive
 * (they stream after the text), the number shows without a preview.
 */
function citationLink(
  sources: (SourceItem & { id: string })[],
  renderLink: RenderResponseLink,
): RenderResponseLink {
  return function CitationOrLink(props) {
    if (!props.href?.startsWith("#source:")) return renderLink(props)

    const ids = props.href.slice("#source:".length).split(",")
    const cited = sources.filter((source) => ids.includes(source.id))

    return cited.length ? (
      <InlineCitation label={citationLabel(sources, cited)} sources={cited} />
    ) : (
      <span className="assistant-citation-pending">{props.children}</span>
    )
  }
}

export function AssistantTurn({
  message,
  incomplete,
  stopped,
  latest,
  onRegenerate,
  onSuggestion,
  onAnswer,
  onDecide,
  renderLink,
  branch,
  posted,
  onPost,
  onOpenWork,
}: {
  message: AssistantMessage
  /** Still streaming, or cut off by an error that Try again will replace. */
  incomplete: boolean
  stopped: boolean
  /** The last reply, while the assistant is idle: it offers regenerate and follow-ups. */
  latest: boolean
  onRegenerate: () => void
  onSuggestion: (text: string) => void
  onAnswer: (toolCallId: string, projectId: string) => void
  onDecide: (approvalId: string, approved: boolean) => void
  renderLink: RenderResponseLink
  /** Moves between versions of this reply. */
  branch?: ReactNode
  /** Drafts already posted to their project, by artifact id. */
  posted: string[]
  onPost: (artifactId: string, projectId: string, markdown: string) => void
  /** Opens this reply's work in the conversation panel. */
  onOpenWork: () => void
}) {
  const text = messageText(message)

  if (message.role === "user")
    return (
      <Message align="end" className="assistant-prompt">
        <MessageContent>
          <SentAttachments message={message} />
          {text && (
            <Bubble variant="secondary" align="end">
              <BubbleContent>
                <span className="sr-only">You: </span>
                {text}
              </BubbleContent>
            </Bubble>
          )}
        </MessageContent>
      </Message>
    )

  const sources = sourceItems(message.parts)
  const steps = message.parts.filter((part) => part.type === "data-step")
  const firstStep = message.parts.findIndex((part) => part.type === "data-step")

  const suggestions = message.parts.find(
    (part) => part.type === "data-suggestions",
  )?.data

  return (
    <ResponseLinkContext value={citationLink(sources, renderLink)}>
      <Message className="assistant-reply">
        <MessageContent>
          <span className="sr-only">Assistant: </span>
          {message.parts.map((part, index) => (
            <ReplyPart
              key={partKey(part, index)}
              part={part}
              firstStep={index === firstStep}
              steps={steps}
              incomplete={incomplete}
              latest={latest}
              posted={posted}
              onAnswer={onAnswer}
              onDecide={onDecide}
              onPost={onPost}
              onOpenWork={onOpenWork}
            />
          ))}
          {stopped && (
            <MessageFooter className="px-0">
              You stopped this reply.
            </MessageFooter>
          )}
          {!incomplete && <Sources sources={sources} />}
          {!incomplete && text && (
            <MessageActions aria-label="Reply actions">
              {branch}
              <MessageCopyAction text={copyText(text)} />
              {latest && (
                <MessageAction label="Regenerate" onClick={onRegenerate}>
                  <RefreshCcw aria-hidden="true" />
                </MessageAction>
              )}
            </MessageActions>
          )}
          {latest && suggestions && (
            <Suggestions aria-label="Follow-up questions">
              {suggestions.map((suggestion) => (
                <Suggestion
                  key={suggestion}
                  suggestion={suggestion}
                  onSelect={onSuggestion}
                />
              ))}
            </Suggestions>
          )}
        </MessageContent>
      </Message>
    </ResponseLinkContext>
  )
}
