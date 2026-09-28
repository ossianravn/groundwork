import { useEffect, useRef, type ComponentProps } from "react"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { ArrowUpRight } from "lucide-react"
import { Button, buttonVariants } from "@/kit/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/kit/ui/alert"
import { InboxLayout } from "@/features/inbox/inbox-layout"
import { InboxList, type InboxLinkComponent } from "@/features/inbox/inbox-list"
import { InboxDetail } from "@/features/inbox/inbox-detail"
import {
  MessageComposer,
  ReplyComposer,
} from "@/features/inbox/message-composer"
import { inboxMessages } from "@/demo/use-inbox"
import scenarios from "@/demo/data/scenarios.json"
import { useDemoWorkspace } from "./workspace-context"
import { useRouteFocus } from "./use-route-focus"
import { ProjectDetailLink } from "./project-detail-link"

function MessageLink({
  messageId,
  ...props
}: ComponentProps<InboxLinkComponent>) {
  const search = useSearch({ from: "/app/demo/inbox" })

  return (
    <Link
      {...props}
      to="/app/demo/inbox"
      search={{ ...search, message: messageId }}
      resetScroll={false}
    />
  )
}

export function InboxRoute() {
  const { demo } = useDemoWorkspace()
  const search = useSearch({ from: "/app/demo/inbox" })
  const navigate = useNavigate()
  const { dispatch, createdId, acknowledgeCreated } = demo.inbox

  const { failure } = demo.inbox

  const previous = useRef(search.message)
  useRouteFocus()

  const messages = inboxMessages(
    demo.inbox.entries,
    demo.workspace.people,
    demo.projects,
    demo.workspace.currentUserId,
  )

  const selected = messages.find((message) => message.id === search.message)

  const visible = messages.filter(
    (message) => search.filter === "all" || !message.read,
  )

  useEffect(() => {
    if (!createdId) return
    void navigate({
      to: "/app/demo/inbox",
      search: {
        scenario: "normal",
        filter: "all",
        message: createdId,
      },
      resetScroll: false,
    })
    acknowledgeCreated()
  }, [createdId, acknowledgeCreated, navigate])

  useEffect(() => {
    const prior = previous.current
    previous.current = search.message

    if (prior === search.message) return
    dispatch({ type: "clear-send-error" })

    const frame = requestAnimationFrame(() => {
      if (search.message)
        document.getElementById("inbox-message-title")?.focus()
      else if (prior)
        (
          document.getElementById(`inbox-message-${prior}`) ??
          document.getElementById("main-content")
        )?.focus()
    })

    return () => cancelAnimationFrame(frame)
  }, [search.message, dispatch])

  function changeRead(ids: string[], read: boolean) {
    demo.inbox.setRead(ids, read, search.scenario)
  }

  function compose() {
    dispatch({ type: "compose-open", open: true })
  }

  function sendContext() {
    return {
      id: crypto.randomUUID(),
      authorId: demo.workspace.currentUserId,
      date: new Date().toISOString(),
      memberIds: demo.workspace.members.map((member) => member.id),
      projectIds: demo.projects.map((project) => project.id),
    }
  }

  return (
    <>
      <title>Inbox · {demo.workspace.name}</title>
      <InboxLayout
        onCompose={compose}
        filter={search.filter}
        unreadCount={demo.inbox.unreadCount}
        selected={!!search.message}
        onFilter={(filter) => {
          demo.inbox.clearFailure()
          void navigate({
            to: "/app/demo/inbox",
            search: { ...search, filter, message: "" },
          })
        }}
        onReadAll={() =>
          changeRead(
            messages
              .filter((message) => !message.read)
              .map((message) => message.id),
            true,
          )
        }
        failure={
          failure && (
            <Alert variant="destructive" className="inbox-failure">
              <AlertTitle>Read status wasn't changed</AlertTitle>
              <AlertDescription>
                {scenarios["inbox-failure"].message}
                <Button
                  variant="outline"
                  onClick={() => changeRead(failure.ids, failure.read)}
                >
                  Try again
                </Button>
              </AlertDescription>
            </Alert>
          )
        }
        list={
          <InboxList
            messages={visible}
            selectedId={search.message}
            unreadOnly={search.filter === "unread"}
            LinkComponent={MessageLink}
          />
        }
        detail={
          <InboxDetail
            onCompose={compose}
            members={demo.workspace.people}
            currentUserId={demo.workspace.currentUserId}
            reply={
              selected &&
              (demo.workspace.members.some(
                (member) => member.id === selected.memberId,
              ) ? (
                <ReplyComposer
                  recipient={selected.sender?.name ?? "member"}
                  value={demo.inbox.replies[selected.id] ?? ""}
                  onChange={(body) =>
                    dispatch({ type: "reply-draft", id: selected.id, body })
                  }
                  onSend={() =>
                    dispatch({
                      type: "send-reply",
                      threadId: selected.id,
                      context: sendContext(),
                    })
                  }
                  error={demo.inbox.sendError}
                />
              ) : (
                <p className="inbox-reply text-muted-foreground">
                  This member is no longer in the workspace.
                </p>
              ))
            }
            message={selected}
            missing={!!search.message && !selected}
            onBack={() => {
              void navigate({
                to: "/app/demo/inbox",
                search: { ...search, message: "" },
                resetScroll: false,
              })
            }}
            onReadChange={(read) => changeRead([search.message], read)}
            projectLink={
              selected?.project && (
                <ProjectDetailLink
                  projectId={selected.projectId}
                  id="inbox-open-project"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  Open project{" "}
                  <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
                </ProjectDetailLink>
              )
            }
          />
        }
      />
      <MessageComposer
        open={demo.inbox.composeOpen}
        onOpenChange={(open) => dispatch({ type: "compose-open", open })}
        draft={demo.inbox.compose}
        error={demo.inbox.sendError}
        members={demo.workspace.members.filter(
          (member) => member.id !== demo.workspace.currentUserId,
        )}
        projects={demo.projects}
        onChange={(patch) => dispatch({ type: "compose", patch })}
        onDiscard={() => {
          dispatch({ type: "discard-compose" })
        }}
        onSend={() => dispatch({ type: "send-new", context: sendContext() })}
      />
    </>
  )
}
