import type { Project, ProjectTask } from "./model"
import type { ProjectRecords } from "./project-save"
import { withTaskCounts } from "./project-tasks"

/** What a reversible project change replaced, for a short-lived Undo. */
export interface ProjectUndo {
  changes: { before: Project; after: Project }[]
  /** A missing before or after means the change added or removed the task. */
  taskChanges: { before?: ProjectTask; after?: ProjectTask; index: number }[]
  eventIds: string[]
}

/** Compare records before and after a change; unchanged items keep their identity. */
export function captureProjectUndo(
  previous: ProjectRecords,
  next: ProjectRecords,
): ProjectUndo | null {
  const after = new Map(next.projects.map((project) => [project.id, project]))
  const knownEvents = new Set(previous.activity.map((event) => event.id))

  const changes = previous.projects.flatMap((before) => {
    const current = after.get(before.id)

    return current && current !== before ? [{ before, after: current }] : []
  })

  const taskChanges = taskDifferences(previous.tasks, next.tasks)

  if (changes.length === 0 && taskChanges.length === 0) return null

  return {
    changes,
    taskChanges,
    eventIds: next.activity
      .filter((event) => !knownEvents.has(event.id))
      .map((event) => event.id),
  }
}

function taskDifferences(previous: ProjectTask[], next: ProjectTask[]) {
  const before = new Map(previous.map((task) => [task.id, task]))
  const after = new Map(next.map((task) => [task.id, task]))

  const changed = previous.flatMap((task, index) =>
    after.get(task.id) === task
      ? []
      : [{ before: task, after: after.get(task.id), index }],
  )

  const added = next.flatMap((task, index) =>
    before.has(task.id) ? [] : [{ before: undefined, after: task, index }],
  )

  return [...changed, ...added]
}

/**
 * Restore the earlier values and remove the change's events. A project or
 * task edited again since the change keeps that later edit.
 */
export function revertProjectChange(
  records: ProjectRecords,
  undo: ProjectUndo,
): ProjectRecords {
  const removed = new Set(undo.eventIds)

  let tasks = records.tasks.flatMap((task) => {
    const change = undo.taskChanges.find((item) => item.after === task)

    if (!change) return [task]

    return change.before ? [change.before] : []
  })

  // Put back tasks the change removed, at their earlier position.
  for (const change of undo.taskChanges) {
    if (change.after || !change.before) continue

    const at = Math.min(change.index, tasks.length)

    tasks = [...tasks.slice(0, at), change.before, ...tasks.slice(at)]
  }

  const projects = records.projects.map((project) => {
    const change = undo.changes.find((item) => item.after === project)

    return change ? change.before : project
  })

  return {
    projects: withTaskCounts(projects, tasks),
    activity: records.activity.filter((event) => !removed.has(event.id)),
    tasks,
  }
}
