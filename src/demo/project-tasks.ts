import {
  documentText,
  textDocument,
  type RichTextDocument,
} from "@/kit/rich-text/document"
import taskData from "./data/tasks.json"
import type { Activity, Project, ProjectTask } from "./model"

// Fixture descriptions are plain text; the app edits them as rich text.
export const initialTasks: ProjectTask[] = taskData.map(
  ({ description, ...task }) =>
    description ? { ...task, description: textDocument(description) } : task,
)

/** A description with no text is stored as none. */
const describedAs = (description: RichTextDocument | undefined) =>
  description && documentText(description) ? description : undefined

export interface TaskRecords {
  projects: Project[]
  activity: Activity[]
  tasks: ProjectTask[]
}

export type TaskChange =
  | {
      kind: "add"
      projectId: string
      title: string
      assigneeId: string | null
      description?: RichTextDocument
    }
  | { kind: "describe"; taskId: string; description: RichTextDocument }
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

/** Completing a project completes its remaining tasks on that day. */
export function completeProjectTasks(
  tasks: ProjectTask[],
  projectId: string,
  date: string,
) {
  return tasks.map((task) =>
    task.projectId === projectId && !task.done
      ? { ...task, done: true, completedAt: date }
      : task,
  )
}

/** A task reopened loses its completion day. */
function reopened(task: ProjectTask): ProjectTask {
  const open = { ...task, done: false }

  delete open.completedAt

  return open
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

    const description = describedAs(change.description)

    const created: ProjectTask = {
      id: context.id(),
      projectId: project.id,
      title,
      done: false,
      assigneeId: change.assigneeId,
      createdAt: context.date,
    }

    if (description) created.description = description

    const at = last < 0 ? tasks.length : last + 1

    tasks = [...tasks.slice(0, at), created, ...tasks.slice(at)]
  } else if (task && change.kind === "toggle") {
    tasks = replace(
      tasks,
      task.done
        ? reopened(task)
        : { ...task, done: true, completedAt: context.date },
    )
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
  } else if (task && change.kind === "describe") {
    const description = describedAs(change.description)
    const described: ProjectTask = { ...task, description }

    // An emptied description is removed rather than kept as an empty key.
    if (!description) delete described.description

    tasks = replace(tasks, described)
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

export interface NewTask {
  title: string
  assigneeId: string | null
}

/**
 * Adds several tasks to one project in order, as one change. A completed or
 * missing project takes none; the result says how many were added.
 */
export function addProjectTasks(
  records: TaskRecords,
  projectId: string,
  tasks: NewTask[],
  context: TaskContext,
) {
  const next = tasks.reduce(
    (current, task) =>
      applyTaskChange(current, { kind: "add", projectId, ...task }, context),
    records,
  )

  return { records: next, added: next.tasks.length - records.tasks.length }
}
