import { useEffect, useState, type ComponentProps } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useChat } from "@ai-sdk/react"
import type { AssistantRequest } from "@/demo/assistant/assistant-types"
import { createAssistantChat } from "@/demo/assistant/create-assistant-chat"
import { AssistantChat } from "@/features/assistant/assistant-chat"
import script from "@/demo/data/assistant.json"
import { useDemoState } from "./demo-state"
import { useRouteFocus } from "./use-route-focus"

/**
 * Links in replies: workspace paths use the router, others open normally.
 * A project opened from a reply offers Back to assistant.
 */
function ReplyLink({ href: path, onClick, ...props }: ComponentProps<"a">) {
  const navigate = useNavigate()

  const href = path?.startsWith("/app/demo/projects/")
    ? `${path}?returnTo=${encodeURIComponent("/app/demo/assistant")}`
    : path

  return (
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event)

        if (
          event.defaultPrevented ||
          !href?.startsWith("/") ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return

        event.preventDefault()
        void navigate({ href })
      }}
      {...props}
    />
  )
}

export function AssistantRoute() {
  const { demo, assistant } = useDemoState()
  const { scenario } = useSearch({ from: "/app/demo/assistant" })

  const { generation, adopt, markStopped } = assistant

  // The demo state keeps the conversation; this page creates it, so the AI
  // SDK loads with the page. A new generation (New chat, Reset) starts over.
  const [session, setSession] = useState(() => ({
    generation,
    chat: assistant.chat ?? createAssistantChat(markStopped),
  }))

  if (session.generation !== generation)
    setSession({
      generation,
      chat: assistant.chat ?? createAssistantChat(markStopped),
    })

  useEffect(() => adopt(session.chat), [adopt, session.chat])

  const {
    messages,
    status,
    error,
    sendMessage,
    stop,
    regenerate,
    addToolOutput,
    addToolApprovalResponse,
  } = useChat({ chat: session.chat, throttle: 40 })

  useRouteFocus()

  // Read when a request is made, so replies reflect the records at that
  // time. createTasks is the tool implementation an approval runs.
  const request = () => ({
    body: {
      scenario,
      context: {
        projects: demo.projects,
        activity: demo.activity,
        people: demo.workspace.people,
        referenceDate: demo.workspace.referenceDate,
      },
      actions: {
        createTasks: ({ projectId, tasks }) =>
          demo.addTasks(
            projectId,
            tasks.map(({ title, assigneeId }) => ({ title, assigneeId })),
          ),
      },
    } satisfies AssistantRequest,
  })

  return (
    <>
      <title>{`Assistant · ${demo.workspace.name}`}</title>
      <AssistantChat
        intro={script}
        messages={messages}
        status={status}
        error={error}
        stopped={assistant.stopped}
        onSend={(text) => void sendMessage({ text }, request())}
        onStop={() => void stop()}
        onRegenerate={() => void regenerate(request())}
        onNewChat={assistant.newChat}
        onAnswer={(toolCallId, projectId) =>
          void addToolOutput({
            tool: "chooseProject",
            toolCallId,
            output: { projectId },
            options: request(),
          })
        }
        onDecide={(id, approved) =>
          void addToolApprovalResponse({ id, approved, options: request() })
        }
        renderLink={(props) => <ReplyLink {...props} />}
      />
    </>
  )
}
