import { cn } from "cn"
import { MemberAvatar } from "@/kit/member-avatar"
import { ProjectBadge } from "@/components/project-identity"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/kit/ui/empty"
import { formatDate } from "@/demo/model"
import type { InboxMessage } from "@/demo/use-inbox"
import type { ComponentProps, ComponentType } from "react"

export type InboxLinkComponent = ComponentType<
  Omit<ComponentProps<"a">, "href"> & { messageId: string }
>

export function InboxList({
  messages,
  selectedId,
  unreadOnly,
  LinkComponent,
  idPrefix = "inbox-message",
  onNavigate,
}: {
  messages: InboxMessage[]
  selectedId?: string
  unreadOnly: boolean
  LinkComponent: InboxLinkComponent
  idPrefix?: string
  onNavigate?: () => void
}) {
  if (!messages.length)
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>
            {unreadOnly ? "You're all caught up" : "Your inbox is empty"}
          </EmptyTitle>
          <EmptyDescription>
            {unreadOnly
              ? "Read messages are still available in All."
              : "Conversations with your team appear here."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )

  return (
    <ul className="inbox-list">
      {messages.map((message) => (
        <li key={message.id}>
          <LinkComponent
            messageId={message.id}
            onClick={onNavigate}
            id={`${idPrefix}-${message.id}`}
            aria-current={selectedId === message.id ? "true" : undefined}
            className={cn("inbox-row", !message.read && "inbox-row-unread")}
          >
            <span aria-hidden="true">
              <MemberAvatar
                member={
                  message.sender ?? {
                    id: "former",
                    name: "Former member",
                    initials: "?",
                  }
                }
              />
            </span>
            <div className="inbox-row-content">
              <div className="inbox-row-meta">
                <span className="inbox-row-from">
                  <span>{message.sender?.name ?? "Former member"}</span>
                  {message.project ? (
                    <ProjectBadge project={message.project} />
                  ) : message.projectId ? (
                    <span className="inbox-row-project">
                      Project unavailable
                    </span>
                  ) : null}
                </span>
                <time dateTime={message.date}>
                  {formatDate(message.date.slice(0, 10))}
                </time>
              </div>
              <div className="inbox-row-title">
                <span>{message.title}</span>
                {!message.read && (
                  <span className="inbox-unread-dot">
                    <span className="sr-only">Unread</span>
                  </span>
                )}
              </div>
              <p className="inbox-row-preview">
                {message.fromSelf && <span>You: </span>}
                {message.preview}
              </p>
            </div>
          </LinkComponent>
        </li>
      ))}
    </ul>
  )
}
