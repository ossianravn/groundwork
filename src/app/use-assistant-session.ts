import { useEffect, useState } from "react"
import { useSearch } from "@tanstack/react-router"
import { useChat } from "@ai-sdk/react"
import type { AssistantRequest } from "@/demo/assistant/assistant-types"
import { createAssistantChat } from "@/demo/assistant/create-assistant-chat"
import { useDemoState } from "./demo-state"

/**
 * The active conversation's chat. Demo state keeps each conversation; this
 * page creates its Chat on first visit, so the AI SDK loads with the page.
 * Switching conversation switches Chat; each keeps streaming on its own.
 */
export function useAssistantSession() {
  const { demo, assistant } = useDemoState()
  const { scenario } = useSearch({ from: "/app/demo/assistant" })
  const { active, adopt, markStopped } = assistant

  const create = () =>
    createAssistantChat((messageId) => markStopped(active.id, messageId))

  const [session, setSession] = useState(() => ({
    id: active.id,
    chat: active.chat ?? create(),
  }))

  if (session.id !== active.id)
    setSession({ id: active.id, chat: active.chat ?? create() })

  useEffect(
    () => adopt(session.id, session.chat),
    [adopt, session.id, session.chat],
  )

  const chat = useChat({ chat: session.chat, throttle: 40 })

  // Read when a request is made, so replies reflect the records at that
  // time. createTasks is the tool implementation an approval runs.
  const request = () => ({
    body: {
      scenario,
      model: assistant.model,
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

  return { ...chat, request, conversation: active }
}
