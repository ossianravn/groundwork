import { RefreshCcw } from "lucide-react"
import { Bubble, BubbleContent } from "@/kit/ui/bubble"
import { Message, MessageContent, MessageFooter } from "@/kit/ui/message"
import {
  MessageResponse,
  type RenderResponseLink,
} from "@/kit/ai/message-response"
import {
  MessageAction,
  MessageActions,
  MessageCopyAction,
} from "@/kit/ai/message-actions"
import { Suggestion, Suggestions } from "@/kit/ai/suggestion"
import type { AssistantMessage } from "@/demo/assistant/assistant-transport"
import { messageText } from "./assistant-text"

export function AssistantTurn({
  message,
  incomplete,
  stopped,
  latest,
  onRegenerate,
  onSuggestion,
  renderLink,
}: {
  message: AssistantMessage
  /** Still streaming, or cut off by an error that Try again will replace. */
  incomplete: boolean
  stopped: boolean
  /** The last reply, while the assistant is idle: it offers regenerate and follow-ups. */
  latest: boolean
  onRegenerate: () => void
  onSuggestion: (text: string) => void
  renderLink: RenderResponseLink
}) {
  const text = messageText(message)

  if (message.role === "user")
    return (
      <Message align="end" className="assistant-prompt">
        <MessageContent>
          <Bubble variant="secondary" align="end">
            <BubbleContent>
              <span className="sr-only">You: </span>
              {text}
            </BubbleContent>
          </Bubble>
        </MessageContent>
      </Message>
    )

  const suggestions = message.parts.find(
    (part) => part.type === "data-suggestions",
  )?.data

  return (
    <Message className="assistant-reply">
      <MessageContent>
        <span className="sr-only">Assistant: </span>
        {message.parts.map((part, index) =>
          part.type === "text" ? (
            <MessageResponse
              key={index}
              streaming={incomplete}
              renderLink={renderLink}
            >
              {part.text}
            </MessageResponse>
          ) : null,
        )}
        {stopped && (
          <MessageFooter className="px-0">
            You stopped this reply.
          </MessageFooter>
        )}
        {!incomplete && text && (
          <MessageActions aria-label="Reply actions">
            <MessageCopyAction text={text} />
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
  )
}
