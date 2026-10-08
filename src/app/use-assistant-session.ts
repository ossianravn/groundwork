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
  const { demo, assistant, files } = useDemoState()
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
      tools: assistant.tools,
      context: {
        projects: demo.projects,
        tasks: demo.tasks,
        activity: demo.activity,
        people: demo.workspace.people,
        files: files.files,
        referenceDate: demo.workspace.referenceDate,
      },
      actions: {
        createTasks: ({ projectId, tasks }) =>
          demo.addTasks(
            projectId,
            tasks.map(({ title, assigneeId }) => ({ title, assigneeId })),
          ),
        // Reassign as planned; deferred tasks stay open, noted in a comment
        // on each of their projects.
        applyPlan: ({ projects, moves, deferred }) => {
          demo.assignTasks(
            moves.map(({ taskId, to }) => ({ taskId, assigneeId: to })),
          )

          for (const project of projects) {
            const waiting = deferred.filter((t) => t.projectId === project.id)

            if (waiting.length)
              demo.postComment(
                project.id,
                `Deferred until after the due date, as planned with the assistant:\n${waiting.map((task) => `- ${task.title}`).join("\n")}`,
              )
          }
        },
      },
      answers: active.answers,
    } satisfies AssistantRequest,
  })

  return { ...chat, request, conversation: active }
}
