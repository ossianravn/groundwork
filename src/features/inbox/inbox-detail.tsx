import type { ReactNode } from "react"
import { ArrowLeft, Mail, MailOpen } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { ProjectBadge } from "@/components/project-identity"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/kit/ui/empty"
import type { Member } from "@/demo/model"
import type { InboxMessage } from "@/demo/use-inbox"
import { MessageThread } from "./message-thread"

export function InboxDetail({
  message,
  missing,
  projectLink,
  onReadChange,
  onBack,
  members,
  currentUserId,
  reply,
}: {
  message: InboxMessage | undefined
  missing: boolean
  projectLink: ReactNode
  onReadChange: (read: boolean) => void
  onBack: () => void
  members: Member[]
  currentUserId: string
  reply: ReactNode
}) {
  if (!message)
    return (
      <div className="inbox-detail inbox-detail-empty">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>
              {missing
                ? "Conversation unavailable"
                : "Your team's conversations"}
            </EmptyTitle>
            <EmptyDescription>
              {missing
                ? "It may belong to a previous demo session."
                : "Select a conversation to read it here."}
            </EmptyDescription>
          </EmptyHeader>
          {missing && (
            <EmptyContent>
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft aria-hidden="true" />
                Back to inbox
              </Button>
            </EmptyContent>
          )}
        </Empty>
      </div>
    )

  return (
    <article className="inbox-detail" aria-labelledby="inbox-message-title">
      <header className="inbox-message-header">
        <Button variant="ghost" onClick={onBack} className="inbox-back">
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          Back
        </Button>
        <div className="inbox-message-heading">
          <h2 id="inbox-message-title" tabIndex={-1}>
            {message.title}
          </h2>
          <Button
            variant="ghost"
            onClick={() => onReadChange(!message.read)}
            aria-label={message.read ? "Mark unread" : "Mark read"}
          >
            {message.read ? (
              <Mail data-icon="inline-start" aria-hidden="true" />
            ) : (
              <MailOpen data-icon="inline-start" aria-hidden="true" />
            )}
            <span className="inbox-read-label">
              {message.read ? "Mark unread" : "Mark read"}
            </span>
          </Button>
        </div>
        {message.project && (
          <div className="inbox-project-context">
            <ProjectBadge project={message.project} />
            {projectLink}
          </div>
        )}
        {!message.project && message.projectId && (
          <p className="text-muted-foreground">Project unavailable</p>
        )}
      </header>
      <MessageThread
        key={message.id}
        posts={message.posts}
        members={members}
        currentUserId={currentUserId}
      />
      {reply}
    </article>
  )
}
