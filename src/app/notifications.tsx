import { useRef, useState, type ComponentProps } from "react"
import { Link } from "@tanstack/react-router"
import { Bell } from "lucide-react"
import { Button, buttonVariants } from "@/kit/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/kit/ui/popover"
import { InboxList, type InboxLinkComponent } from "@/features/inbox/inbox-list"
import { inboxMessages } from "@/demo/use-inbox"
import { useDemoState } from "./demo-state"
import { defaultInboxSearch } from "./inbox-search"

function NotificationLink({
  messageId,
  ...props
}: ComponentProps<InboxLinkComponent>) {
  return (
    <Link
      {...props}
      to="/app/demo/inbox"
      search={{ ...defaultInboxSearch, message: messageId }}
    />
  )
}

/** The bell's popover: recent messages from others, opening into the Inbox. */
export function Notifications() {
  const { demo } = useDemoState()
  const [open, setOpen] = useState(false)
  const navigated = useRef(false)
  const list = useRef<HTMLDivElement>(null)

  const messages = inboxMessages(
    demo.inbox.entries
      .map((entry) => ({
        ...entry,
        posts: entry.posts.filter(
          (post) => post.memberId !== demo.workspace.currentUserId,
        ),
      }))
      .filter((entry) => entry.posts.length > 0),
    demo.workspace.people,
    demo.projects,
    demo.workspace.currentUserId,
  ).sort((a, b) => b.date.localeCompare(a.date))

  const unread = messages.filter((message) => !message.read)

  function navigate() {
    navigated.current = true
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) navigated.current = false
        setOpen(next)
      }}
      onOpenChangeComplete={(next) => {
        if (!next && navigated.current)
          (
            document.getElementById("inbox-message-title") ??
            document.getElementById("main-content")
          )?.focus({ preventScroll: true })
      }}
    >
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="notification-trigger"
            aria-label={`Notifications${unread.length ? `, ${unread.length} unread` : ""}`}
          />
        }
      >
        <Bell aria-hidden="true" />
        {!!unread.length && (
          <span className="notification-dot" aria-hidden="true" />
        )}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="notification-popover"
        finalFocus={() => !navigated.current}
      >
        <div className="notification-header">
          <PopoverTitle className="notification-title">
            Notifications
          </PopoverTitle>
          {!!unread.length && (
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                demo.inbox.setRead(
                  unread.map((message) => message.id),
                  true,
                  "normal",
                )
                // The button goes away; keep focus in the popover.
                list.current?.querySelector("a")?.focus()
              }}
            >
              Mark all read
            </Button>
          )}
        </div>
        <div ref={list} className="notification-list">
          <InboxList
            messages={messages}
            unreadOnly={false}
            idPrefix="notification"
            LinkComponent={NotificationLink}
            onNavigate={navigate}
          />
        </div>
        <div className="notification-footer">
          <NotificationLink
            messageId=""
            onClick={navigate}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Open inbox
          </NotificationLink>
        </div>
      </PopoverContent>
    </Popover>
  )
}
