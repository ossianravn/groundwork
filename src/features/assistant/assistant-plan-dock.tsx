import { TaskPlan } from "@/kit/ai/task-plan"
import type { AssistantMessage } from "@/demo/assistant/assistant-types"

/**
 * The latest reply's working plan, docked above the composer. It belongs to
 * the reply in progress or just finished, so it hides while a new question
 * waits for its reply. A task still in progress when the reply was stopped
 * reads as stopped.
 */
export function AssistantPlanDock({
  messages,
  streaming,
  stopped,
}: {
  messages: AssistantMessage[]
  streaming: boolean
  /** Replies the person stopped. */
  stopped: string[]
}) {
  const last = messages.at(-1)

  if (last?.role !== "assistant") return null

  // One part per reply: it is replaced in place as the reply moves on.
  const part = last.parts.find((item) => item.type === "data-todo")

  if (part?.type !== "data-todo") return null

  const interrupted = !streaming && stopped.includes(last.id)

  const tasks = part.data.tasks.map((task) =>
    interrupted && task.status === "doing"
      ? { ...task, status: "dropped" as const, note: "Stopped" }
      : task,
  )

  return (
    <TaskPlan
      className="assistant-plan-dock"
      title={part.data.title}
      tasks={tasks}
      note="The assistant's plan for this request"
    />
  )
}
