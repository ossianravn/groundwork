import { useState, type ComponentProps } from "react"
import { flushSync } from "react-dom"
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
import { Checkpoint } from "@/kit/ai/checkpoint"
import { MessageBranch } from "@/kit/ai/message-branch"
import type { PromptSubmission } from "@/kit/ai/prompt-input"
import type { RenderResponseLink } from "@/kit/ai/response-link"
import { Queue } from "@/kit/ai/queue"
import { Suggestion, Suggestions } from "@/kit/ai/suggestion"
import type { AssistantMessage } from "@/demo/assistant/assistant-types"
import { AssistantComposer } from "./assistant-composer"
import { AssistantTurn } from "./assistant-message"
import { announcement, awaitsPerson, messageText } from "./assistant-text"
import { useMessageQueue } from "./use-message-queue"

export interface AssistantIntro {
  title: string
  description: string
  suggestions: string[]
}

type ComposerOptions = Pick<
  ComponentProps<typeof AssistantComposer>,
  "projects" | "models" | "model" | "onModelChange" | "usage"
>

const textOnly = (text: string): PromptSubmission => ({
  text,
  files: [],
  references: [],
})

export function AssistantChat({
  intro,
  initialDraft = "",
  messages,
  status,
  error,
  stopped,
  posted,
  onPost,
  versions,
  composer,
  onSend,
  onStop,
  onRegenerate,
  onRestore,
  onNewChat,
  onAnswer,
  onDecide,
  renderLink,
}: {
  intro: AssistantIntro
  /** A question to start with, such as one brought from a help guide. */
  initialDraft?: string
  messages: AssistantMessage[]
  status: ChatStatus
  error: Error | undefined
  stopped: string[]
  /** Drafts already posted to their project, by artifact id. */
  posted: string[]
  onPost: (artifactId: string, projectId: string, markdown: string) => void
  /** Versions of the latest reply, when Regenerate has made more than one. */
  versions?: { index: number; count: number; onSelect: (index: number) => void }
  composer: ComposerOptions
  onSend: (submission: PromptSubmission) => void
  onStop: () => void
  onRegenerate: () => void
  /** Returns the conversation to before this message. */
  onRestore: (messageId: string) => void
  onNewChat: () => void
  onAnswer: (toolCallId: string, projectId: string) => void
  onDecide: (approvalId: string, approved: boolean) => void
  renderLink: RenderResponseLink
}) {
  const [draft, setDraft] = useState(initialDraft)
  const [started, setStarted] = useState(false)
  const busy = status === "submitted" || status === "streaming"
  const last = messages.at(-1)
  const awaiting = status === "ready" && awaitsPerson(last)
  const queue = useMessageQueue(status === "ready" && !awaiting, onSend)
  // Bridges the moment between sending and the message arriving; after that
  // the messages decide, so a reset returns to the start layout.

  if (started && messages.length) setStarted(false)

  const empty = messages.length === 0 && !started

  // Suggestions, Regenerate, Try again, answers and decisions disappear once
  // used, so focus moves to the composer, where the next question is written.
  const focusPrompt = () => document.getElementById("assistant-prompt")?.focus()

  // The first message moves the composer from the middle to the bottom; a
  // view transition animates the move where the browser supports it.
  const start = () => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches

    if (!document.startViewTransition || reduce) return setStarted(true)

    document.startViewTransition(() => flushSync(() => setStarted(true)))
  }

  // While a reply streams or waits for a decision, new messages queue.
  const send = (submission: PromptSubmission) => {
    if (empty) start()

    if (busy || awaiting) queue.add(submission)
    else onSend(submission)

    focusPrompt()
  }

  const after =
    <T extends unknown[]>(action: (...args: T) => void) =>
    (...args: T) => {
      action(...args)
      focusPrompt()
    }

  const suggestions = (list: string[], label: string) => (
    <Suggestions aria-label={label} className="justify-center">
      {list.map((suggestion) => (
        <Suggestion
          key={suggestion}
          suggestion={suggestion}
          onSelect={(text) => send(textOnly(text))}
        />
      ))}
    </Suggestions>
  )

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="assistant-page"
      data-empty={empty || undefined}
    >
      <h1 className="sr-only">Assistant</h1>
      {!empty && (
        <PageActions>
          <PageAction
            id="assistant-new-chat"
            icon={SquarePen}
            label="New chat"
            onClick={() => {
              setDraft("")
              setStarted(false)
              queue.clear()
              onNewChat()
              focusPrompt()
            }}
          />
        </PageActions>
      )}
      {empty && (
        <ConversationEmptyState
          className="assistant-start"
          title={intro.title}
          description={intro.description}
        />
      )}
      {!empty && (
        <Conversation className="assistant-conversation">
          {messages.map((message, index) => (
            <ConversationItem
              key={message.id}
              messageId={message.id}
              scrollAnchor={message.role === "user"}
            >
              {message.role === "user" && index > 0 && (
                <Checkpoint
                  className="assistant-checkpoint"
                  label={`Restore to before “${messageText(message) || "attachments"}”`}
                  onRestore={() => {
                    onRestore(message.id)
                    setDraft(messageText(message))
                    focusPrompt()
                  }}
                />
              )}
              <AssistantTurn
                branch={
                  versions && status === "ready" && message === last ? (
                    <MessageBranch {...versions} />
                  ) : undefined
                }
                message={message}
                incomplete={
                  busy || status === "error" ? message === last : false
                }
                stopped={stopped.includes(message.id)}
                latest={status === "ready" && message === last}
                onRegenerate={after(onRegenerate)}
                onSuggestion={(text) => send(textOnly(text))}
                onAnswer={after(onAnswer)}
                onDecide={after(onDecide)}
                posted={posted}
                onPost={onPost}
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
                  <Button variant="outline" onClick={after(onRegenerate)}>
                    Try again
                  </Button>
                </AlertDescription>
              </Alert>
            </ConversationItem>
          )}
        </Conversation>
      )}
      <ConversationStatus>
        {announcement(status, last, !!last && stopped.includes(last.id), error)}
      </ConversationStatus>
      <Queue
        className="assistant-queue"
        messages={queue.messages}
        label={
          awaiting
            ? "Sends after you answer above"
            : "Sends when the reply finishes"
        }
        onRemove={after(queue.remove)}
      />
      <AssistantComposer
        {...composer}
        status={status}
        waiting={awaiting}
        draft={draft}
        onDraftChange={setDraft}
        onSubmit={send}
        onQueue={(text) => queue.add(textOnly(text))}
        onStop={onStop}
      />
      {empty && (
        <div className="assistant-start-suggestions">
          {suggestions(intro.suggestions, "Suggested questions")}
        </div>
      )}
    </main>
  )
}
