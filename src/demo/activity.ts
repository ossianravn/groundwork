import { sameDocument, type RichTextDocument } from "@/kit/rich-text/document"
import type { Activity, Member, Project, ProjectLink } from "./model"
import { sameProjectLinks } from "./project-links"

export const activityKinds = {
  tasks: "Task progress",
  created: "Project created",
  updated: "Project edited",
  status: "Status changed",
  owner: "Owner assigned",
}

export type ActivityKind = keyof typeof activityKinds

export const activityFields = {
  name: "Project name",
  description: "Description",
  ownerId: "Owner",
  dueDate: "Due date",
  status: "Status",
  completedTasks: "Completed tasks",
  tags: "Tags",
  links: "Related links",
}

export type ActivityChange =
  | {
      field: Exclude<
        keyof typeof activityFields,
        "description" | "tags" | "links"
      >
      before: string | number
      after: string | number
    }
  | {
      field: "description"
      before: RichTextDocument
      after: RichTextDocument
    }
  | { field: "tags"; before: string[]; after: string[] }
  | { field: "links"; before: ProjectLink[]; after: ProjectLink[] }

export function projectChanges(
  before: Project,
  after: Project,
): ActivityChange[] {
  const changes: ActivityChange[] = []

  for (const field of [
    "name",
    "description",
    "ownerId",
    "dueDate",
    "status",
    "completedTasks",
  ] as const) {
    if (field === "description") {
      if (!sameDocument(before.description, after.description))
        changes.push({
          field,
          before: before.description,
          after: after.description,
        })
    } else if (before[field] !== after[field]) {
      changes.push({ field, before: before[field], after: after[field] })
    }
  }

  if (JSON.stringify(before.tags) !== JSON.stringify(after.tags))
    changes.push({ field: "tags", before: before.tags, after: after.tags })

  if (!sameProjectLinks(before.links, after.links))
    changes.push({ field: "links", before: before.links, after: after.links })

  return changes
}

export interface ActivityFilters {
  q: string
  member: string
  kind: string
  period: number
}

export function filterActivity(
  activity: Activity[],
  projects: Project[],
  people: Member[],
  filters: ActivityFilters,
  referenceDate: string,
) {
  const start = new Date(`${referenceDate}T00:00:00Z`)
  start.setUTCDate(start.getUTCDate() - filters.period + 1)
  const firstDate = start.toISOString().slice(0, 10)
  const terms = filters.q.trim().toLocaleLowerCase().split(/\s+/u)

  return activity
    .slice()
    .reverse()
    .filter((event) => {
      const project = projects.find((item) => item.id === event.projectId)
      const member = people.find((item) => item.id === event.memberId)

      const text =
        `${member?.name ?? "Former member"} ${event.action} ${project?.name ?? "Unavailable project"}`.toLocaleLowerCase()

      return (
        (!filters.member || event.memberId === filters.member) &&
        (!filters.kind || event.kind === filters.kind) &&
        (!filters.period ||
          (event.date >= firstDate && event.date <= referenceDate)) &&
        terms.every((term) => text.includes(term))
      )
    })
    .sort((a, b) => b.date.localeCompare(a.date))
}
