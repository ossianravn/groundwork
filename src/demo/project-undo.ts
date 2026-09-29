import type { Project } from "./model"
import type { ProjectRecords } from "./project-save"

/** What a reversible project change replaced, for a short-lived Undo. */
export interface ProjectUndo {
  changes: { before: Project; after: Project }[]
  eventIds: string[]
}

/** Compare records before and after a change; unchanged projects keep their identity. */
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

  if (changes.length === 0) return null

  return {
    changes,
    eventIds: next.activity
      .filter((event) => !knownEvents.has(event.id))
      .map((event) => event.id),
  }
}

/**
 * Restore the earlier values and remove the change's events. A project edited
 * again since the change keeps that later edit rather than losing it.
 */
export function revertProjectChange(
  records: ProjectRecords,
  undo: ProjectUndo,
): ProjectRecords {
  const removed = new Set(undo.eventIds)

  return {
    projects: records.projects.map((project) => {
      const change = undo.changes.find((item) => item.after === project)

      return change ? change.before : project
    }),
    activity: records.activity.filter((event) => !removed.has(event.id)),
  }
}
