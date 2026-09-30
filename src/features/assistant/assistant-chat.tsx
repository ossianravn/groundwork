import { useState } from "react"
import { SquarePen } from "lucide-react"
import type { ChatStatus } from "ai"
import { Alert, AlertDescription, AlertTitle } from "@/kit/ui/alert"
import { Button } from "@/kit/ui/button"
import { Shimmer } from "@/kit/ui/shimmer"
import { PageAction, PageActions } from "@/kit/shell/page-actions"
import {
  Conversation,
  ConversationEmptyState,
  ConversationItem,
  ConversationStatus,
} from "@/kit/ai/conversation"
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/kit/ai/prompt-input"
import type { RenderResponseLink } from "@/kit/ai/response-link"
import { Queue } from "@/kit/ai/queue"
import { Suggestion, Suggestions } from "@/kit/ai/suggestion"
import type { AssistantMessage } from "@/demo/assistant/assistant-types"
import { AssistantTurn } from "./assistant-message"
import {
  awaitedDecision,
  awaitsPerson,
  messageText,
  spokenText,
} from "./assistant-text"
import { useMessageQueue } from "./use-message-queue"

export interface AssistantIntro {
  title: string
  description: string
  suggestions: string[]
}

function announcement(
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

export function AssistantChat({
  intro,
  messages,
  status,
  error,
  stopped,
  onSend,
  onStop,
  onRegenerate,
  onNewChat,
  onAnswer,
  onDecide,
  renderLink,
}: {
  intro: AssistantIntro
  messages: AssistantMessage[]
  status: ChatStatus
  error: Error | undefined
  stopped: string[]
  onSend: (text: string) => void
  onStop: () => void
  onRegenerate: () => void
  onNewChat: () => void
  onAnswer: (toolCallId: string, projectId: string) => void
  onDecide: (approvalId: string, approved: boolean) => void
  renderLink: RenderResponseLink
}) {
  const [draft, setDraft] = useState("")
  const busy = status === "submitted" || status === "streaming"
  const last = messages.at(-1)
  const awaiting = status === "ready" && awaitsPerson(last)
  const queue = useMessageQueue(status === "ready" && !awaiting, onSend)

  // Suggestions, Regenerate and Try again disappear once used, so focus
  // moves to the composer, where the next question is written.
  const focusPrompt = () => document.getElementById("assistant-prompt")?.focus()

  // While a reply streams or waits for a decision, new messages queue.
  const send = (text: string) => {
    if (busy || awaiting) queue.add(text)
    else onSend(text)

    focusPrompt()
  }

  const decide = (approvalId: string, approved: boolean) => {
    onDecide(approvalId, approved)
    focusPrompt()
  }

  const answer = (toolCallId: string, projectId: string) => {
    onAnswer(toolCallId, projectId)
    focusPrompt()
  }

  const regenerate = () => {
    onRegenerate()
    focusPrompt()
  }

  return (
    <main id="main-content" tabIndex={-1} className="assistant-page">
      <h1 className="sr-only">Assistant</h1>
      {messages.length > 0 && (
        <PageActions>
          <PageAction
            id="assistant-new-chat"
            icon={SquarePen}
            label="New chat"
            onClick={() => {
              setDraft("")
              queue.clear()
              onNewChat()
              focusPrompt()
            }}
          />
        </PageActions>
      )}
      <Conversation className="assistant-conversation">
        {messages.length === 0 && (
          <ConversationEmptyState
            title={intro.title}
            description={intro.description}
          >
            <Suggestions
              aria-label="Suggested questions"
              className="justify-center"
            >
              {intro.suggestions.map((suggestion) => (
                <Suggestion
                  key={suggestion}
                  suggestion={suggestion}
                  onSelect={send}
                />
              ))}
            </Suggestions>
          </ConversationEmptyState>
        )}
        {messages.map((message) => (
          <ConversationItem
            key={message.id}
            messageId={message.id}
            scrollAnchor={message.role === "user"}
          >
            <AssistantTurn
              message={message}
              incomplete={busy || status === "error" ? message === last : false}
              stopped={stopped.includes(message.id)}
              latest={status === "ready" && message === last}
              onRegenerate={regenerate}
              onSuggestion={send}
              onAnswer={answer}
              onDecide={decide}
              renderLink={renderLink}
            />
          </ConversationItem>
        ))}
        {status === "submitted" && (
          <ConversationItem>
            <Shimmer className="assistant-thinking">Thinking…</Shimmer>
          </ConversationItem>
        )}
        {status === "error" && (
          <ConversationItem>
            <Alert variant="destructive" className="assistant-failure">
              <AlertTitle>The reply didn't finish</AlertTitle>
              <AlertDescription>
                {error?.message}
                <Button variant="outline" onClick={regenerate}>
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          </ConversationItem>
        )}
      </Conversation>
      <ConversationStatus>
        {announcement(status, last, !!last && stopped.includes(last.id), error)}
      </ConversationStatus>
      <Queue
        className="assistant-queue"
        messages={queue.queue}
        label={
          awaiting
            ? "Sends after you answer above"
            : "Sends when the reply finishes"
        }
        onRemove={(id) => {
          queue.remove(id)
          focusPrompt()
        }}
      />
      <PromptInput
        className="assistant-composer"
        status={status}
        value={draft}
        onValueChange={setDraft}
        onSubmit={send}
        onQueue={queue.add}
        onStop={onStop}
      >
        <PromptInputTextarea
          id="assistant-prompt"
          aria-label="Message the assistant"
          placeholder={
            busy || awaiting
              ? "Write your next question…"
              : "Ask about projects, tasks or activity"
          }
        />
        <PromptInputFooter>
          <span className="assistant-hint">
            Enter to send, Shift+Enter for a new line
          </span>
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    </main>
  )
}
