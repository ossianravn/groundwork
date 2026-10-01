import type { Member, ProjectStatus } from "./model"
import type { ProjectRecords } from "./project-save"
import { projectChanges } from "./activity"
import { completeProjectTasks } from "./project-tasks"

export type ProjectBulkAction =
  | { kind: "assign"; ownerId: string }
  | { kind: "complete" }
  | { kind: "move"; status: ProjectStatus }

export interface ProjectBulkResult {
  updated: string[]
  unchanged: string[]
  failed: { id: string; name: string; message: string }[]
}

/** A host that can reverse the change attaches undo for the view to offer. */
export type ProjectBulkOutcome = ProjectBulkResult & { undo?: () => void }

export type ProjectBulkHandler = (
  ids: string[],
  action: ProjectBulkAction,
  retry: boolean,
) => ProjectBulkOutcome

export function applyProjectBulkChange(
  records: ProjectRecords,
  ids: string[],
  action: ProjectBulkAction,
  context: {
    members: Member[]
    memberId: string
    date: string
    eventId: () => string
    rejectedIds: string[]
  },
) {
  const result: ProjectBulkResult = { updated: [], unchanged: [], failed: [] }
  const selected = new Set(ids)

  const owner =
    action.kind === "assign"
      ? context.members.find((member) => member.id === action.ownerId)
      : undefined

  const activity = [...records.activity]
  const status = action.kind === "move" ? action.status : "completed"

  for (const id of selected) {
    if (!records.projects.some((project) => project.id === id)) {
      result.failed.push({
        id,
        name: id,
        message: "Project is no longer available.",
      })
    }
  }

  const projects = records.projects.map((project) => {
    if (!selected.has(project.id)) return project

    if (action.kind === "assign" && !owner) {
      result.failed.push({
        id: project.id,
        name: project.name,
        message: "Choose a workspace member.",
      })

      return project
    }

    const unchanged =
      action.kind === "assign"
        ? project.ownerId === action.ownerId
        : project.status === status

    if (unchanged) {
      result.unchanged.push(project.id)

      return project
    }

    if (context.rejectedIds.includes(project.id)) {
      result.failed.push({
        id: project.id,
        name: project.name,
        message: "Could not save this change. Try again.",
      })

      return project
    }

    result.updated.push(project.id)

    const updated =
      action.kind === "assign"
        ? { ...project, ownerId: action.ownerId }
        : {
            ...project,
            status,
            completedTasks:
              status === "completed" ? project.tasks : project.completedTasks,
          }

    activity.push({
      id: context.eventId(),
      projectId: project.id,
      memberId: context.memberId,
      date: context.date,
      kind: action.kind === "assign" ? "owner" : "status",
      changes: projectChanges(project, updated),
      action: owner
        ? `assigned ${owner.name} to`
        : status === "completed"
          ? "finished"
          : status === "in-review"
            ? "requested a review of"
            : project.status === "completed"
              ? "reopened"
              : "resumed work on",
      tasksCompleted:
        action.kind !== "assign" && status === "completed"
          ? project.tasks - project.completedTasks
          : 0,
    })

    return updated
  })

  // Completing a project completes its tasks; the counts already match.
  const tasks = result.updated.reduce(
    (current, id) =>
      projects.find((project) => project.id === id)?.status === "completed"
        ? completeProjectTasks(current, id, context.date)
        : current,
    records.tasks,
  )

  return { records: { projects, activity, tasks }, result }
}
