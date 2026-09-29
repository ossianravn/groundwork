import taskData from "./data/tasks.json"
import type { Activity, Project, ProjectTask } from "./model"

export const initialTasks: ProjectTask[] = taskData

export interface TaskRecords {
  projects: Project[]
  activity: Activity[]
  tasks: ProjectTask[]
}

export type TaskChange =
  | { kind: "add"; projectId: string; title: string; assigneeId: string | null }
  | { kind: "toggle"; taskId: string }
  | { kind: "assign"; taskId: string; assigneeId: string | null }
  | { kind: "move"; taskId: string; offset: -1 | 1 }
  | { kind: "remove"; taskId: string }

export interface TaskContext {
  id: () => string
  memberId: string
  date: string
}

/**
 * A project's task counts always come from its tasks. Projects whose counts
 * already match keep their identity, so undo and memoised views see no change.
 */
export function withTaskCounts(projects: Project[], tasks: ProjectTask[]) {
  return projects.map((project) => {
    const own = tasks.filter((task) => task.projectId === project.id)
    const done = own.filter((task) => task.done).length

    return own.length === project.tasks && done === project.completedTasks
      ? project
      : { ...project, tasks: own.length, completedTasks: done }
  })
}

/** Completing a project completes its remaining tasks. */
export function completeProjectTasks(tasks: ProjectTask[], projectId: string) {
  return tasks.map((task) =>
    task.projectId === projectId && !task.done ? { ...task, done: true } : task,
  )
}

export function applyTaskChange(
  records: TaskRecords,
  change: TaskChange,
  context: TaskContext,
): TaskRecords {
  const task =
    change.kind === "add"
      ? undefined
      : records.tasks.find((item) => item.id === change.taskId)

  const projectId = change.kind === "add" ? change.projectId : task?.projectId
  const project = records.projects.find((item) => item.id === projectId)

  // A completed project's tasks are read-only until it is reopened.
  if (!project || project.status === "completed") return records

  if (change.kind !== "add" && !task) return records

  let { tasks, activity } = records

  if (change.kind === "add") {
    const title = change.title.trim()

    if (!title) return records

    const last = tasks.map((item) => item.projectId).lastIndexOf(project.id)

    const created = {
      id: context.id(),
      projectId: project.id,
      title,
      done: false,
      assigneeId: change.assigneeId,
    }

    const at = last < 0 ? tasks.length : last + 1

    tasks = [...tasks.slice(0, at), created, ...tasks.slice(at)]
  } else if (task && change.kind === "toggle") {
    tasks = replace(tasks, { ...task, done: !task.done })
    activity = task.done
      ? // Reopening removes this session's completion record, if any.
        activity.filter(
          (event) => !(event.taskId === task.id && event.date === context.date),
        )
      : [
          ...activity,
          {
            id: context.id(),
            projectId: project.id,
            memberId: context.memberId,
            date: context.date,
            action: `completed “${task.title}” in`,
            tasksCompleted: 1,
            kind: "tasks",
            taskId: task.id,
          },
        ]
  } else if (task && change.kind === "assign") {
    tasks = replace(tasks, { ...task, assigneeId: change.assigneeId })
  } else if (task && change.kind === "move") {
    tasks = moveTask(tasks, task, change.offset)
  } else if (task && change.kind === "remove") {
    tasks = tasks.filter((item) => item.id !== task.id)
  }

  return {
    projects: withTaskCounts(records.projects, tasks),
    activity,
    tasks,
  }
}

function replace(tasks: ProjectTask[], next: ProjectTask) {
  return tasks.map((item) => (item.id === next.id ? next : item))
}

/** Swap with the nearest task in the same project and state (open or done). */
function moveTask(tasks: ProjectTask[], task: ProjectTask, offset: -1 | 1) {
  const index = tasks.indexOf(task)

  for (
    let other = index + offset;
    other >= 0 && other < tasks.length;
    other += offset
  ) {
    const candidate = tasks[other]

    if (candidate.projectId !== task.projectId || candidate.done !== task.done)
      continue

    const next = [...tasks]

    next[index] = candidate
    next[other] = task

    return next
  }

  return tasks
}
