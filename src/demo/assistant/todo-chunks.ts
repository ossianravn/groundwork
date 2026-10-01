import type {
  AssistantChunk,
  AssistantReply,
  ReplyStage,
  TodoData,
} from "./assistant-types"

type TodoSpec = NonNullable<AssistantReply["todo"]>

/**
 * The working plan after the given stages have streamed: their tasks are
 * done, the next task is in progress (or blocked, when the reply failed)
 * and the rest are still to do.
 */
export function todoState(
  todo: TodoSpec,
  done: ReplyStage[],
  blocked = false,
): TodoData {
  const tasks = todo.tasks.map(({ label, after }, index) => ({
    id: `todo-${index}`,
    label,
    status: done.includes(after) ? ("done" as const) : ("todo" as const),
  }))

  const next = tasks.find((task) => task.status === "todo")

  return {
    title: todo.title,
    tasks: tasks.map((task) =>
      task === next ? { ...task, status: blocked ? "blocked" : "doing" } : task,
    ),
  }
}

/** The working plan as a data part, replaced in place (same id) as it moves. */
export function todoChunk(
  todo: TodoSpec,
  done: ReplyStage[],
  blocked = false,
): AssistantChunk {
  return { type: "data-todo", id: "todo", data: todoState(todo, done, blocked) }
}
