import type { Activity, Project, ProjectTask } from "./model"
import type { ProjectTarget, ProjectValues } from "./project-form"
import { projectChanges } from "./activity"
import { savedProjectLinks } from "./project-links"
import { canonicalProjectTags } from "./project-tags"

export interface ProjectRecords {
  projects: Project[]
  activity: Activity[]
  tasks: ProjectTask[]
}

export interface ProjectSaveEvent {
  projectId: string
  eventId: string
  memberId: string
  date: string
}

export function applyProjectSave(
  records: ProjectRecords,
  target: ProjectTarget,
  values: ProjectValues,
  event: ProjectSaveEvent,
): ProjectRecords {
  const fields = {
    ...values,
    name: values.name.trim(),
    links: savedProjectLinks(values.links),
    tags: canonicalProjectTags(
      values.tags,
      records.projects.flatMap((project) => project.tags),
    ),
  }

  const code = fields.name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()

  const projects =
    target.kind === "create"
      ? [
          {
            ...fields,
            id: event.projectId,
            code,
            status: "in-progress" as const,
            tasks: 0,
            completedTasks: 0,
          },
          ...records.projects,
        ]
      : records.projects.map((project) =>
          project.id === target.id ? { ...project, ...fields, code } : project,
        )

  return {
    projects,
    tasks: records.tasks,
    activity: [
      ...records.activity,
      {
        id: event.eventId,
        projectId: event.projectId,
        memberId: event.memberId,
        date: event.date,
        action: target.kind === "create" ? "created" : "updated",
        tasksCompleted: 0,
        kind: target.kind === "create" ? "created" : "updated",
        changes:
          target.kind === "edit"
            ? records.projects
                .filter((project) => project.id === target.id)
                .flatMap((project) =>
                  projectChanges(project, { ...project, ...fields }),
                )
            : [],
      },
    ],
  }
}
