import * as React from "react"
import { cn } from "cn"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/kit/ui/message-scroller"

/**
 * A chat transcript that follows new messages and anchors each new prompt,
 * with a button back to the latest reply. Streaming text is not announced
 * token by token (the log is silent); announce a finished reply with
 * ConversationStatus instead.
 */
function Conversation({
  className,
  children,
  label = "Conversation",
  ...props
}: React.ComponentProps<"div"> & { label?: string }) {
  return (
    <MessageScrollerProvider autoScroll defaultScrollPosition="last-anchor">
      <MessageScroller
        data-slot="conversation"
        className={cn("min-h-0 flex-1", className)}
        {...props}
      >
        <MessageScrollerViewport aria-label={label}>
          <MessageScrollerContent aria-live="off">
            {children}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  )
}

/** One turn. Anchor the person's prompts so a new question starts at the top. */
const ConversationItem = MessageScrollerItem

function ConversationEmptyState({
  title,
  description,
  children,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  title: React.ReactNode
  description?: React.ReactNode
}) {
  return (
    <div
      data-slot="conversation-empty"
      className={cn(
        "m-auto flex w-full max-w-xl flex-col items-center gap-4 py-8 text-center",
        className,
      )}
      {...props}
    >
      <div className="grid gap-1.5">
        <h2 className="text-base font-semibold text-balance">{title}</h2>
        {description && (
          <p className="text-sm text-balance text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}

/**
 * Announces the conversation's progress to assistive technology: that a reply
 * has started, and the reply itself once it is complete.
 */
function ConversationStatus({ children }: { children: React.ReactNode }) {
  return (
    <div className="sr-only" role="status">
      {children}
    </div>
  )
}

export {
  Conversation,
  ConversationItem,
  ConversationEmptyState,
  ConversationStatus,
}
