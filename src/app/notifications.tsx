import { useRef, type ComponentProps } from "react"
import { Link } from "@tanstack/react-router"
import { Bell } from "lucide-react"
import { Button, buttonVariants } from "@/kit/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/kit/ui/sheet"
import { PanelHeader } from "@/kit/panel-header"
import { InboxList, type InboxLinkComponent } from "@/features/inbox/inbox-list"
import { inboxMessages } from "@/demo/use-inbox"
import { useDemoState } from "./demo-state"
import { defaultInboxSearch } from "./inbox-search"

function NotificationLink({
  messageId,
  ...props
}: ComponentProps<InboxLinkComponent>) {
  return (
    <SheetClose
      nativeButton={false}
      role="link"
      render={
        <Link
          {...props}
          to="/app/demo/inbox"
          search={{ ...defaultInboxSearch, message: messageId }}
        />
      }
    />
  )
}

export function Notifications() {
  const { demo } = useDemoState()
  const navigated = useRef(false)

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

  const unreadCount = messages.filter((message) => !message.read).length

  return (
    <Sheet
      onOpenChange={(open) => {
        if (open) navigated.current = false
      }}
      onOpenChangeComplete={(open) => {
        if (!open && navigated.current)
          (
            document.getElementById("inbox-message-title") ??
            document.getElementById("main-content")
          )?.focus({ preventScroll: true })
      }}
    >
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="notification-trigger"
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
          />
        }
      >
        <Bell aria-hidden="true" />
        {!!unreadCount && (
          <span className="notification-dot" aria-hidden="true" />
        )}
      </SheetTrigger>
      <SheetContent
        showCloseButton={false}
        className="panel-sheet notification-sheet"
        aria-describedby={undefined}
        finalFocus={() => !navigated.current}
      >
        <PanelHeader title="Notifications" />
        <div className="panel-scroll notification-list">
          <InboxList
            messages={messages}
            unreadOnly={false}
            idPrefix="notification"
            LinkComponent={NotificationLink}
            onNavigate={() => {
              navigated.current = true
            }}
          />
        </div>
        <SheetFooter className="panel-footer">
          <NotificationLink
            messageId=""
            onClick={() => {
              navigated.current = true
            }}
            className={buttonVariants({ variant: "outline" })}
          >
            Open inbox
          </NotificationLink>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
