import { sameDocument } from "@/kit/rich-text/document"
import type { Member, NewProject, Project } from "./model"
import { projectLinkError, sameProjectLinks } from "./project-links"

export type ProjectValues = Pick<
  Project,
  "name" | "description" | "ownerId" | "dueDate" | "tags" | "links"
>

export interface ProjectFieldErrors {
  name?: string
  dueDate?: string
  ownerId?: string
  links?: Record<string, string>
}

export type ProjectTarget = { kind: "create" } | { kind: "edit"; id: string }

export type ProjectSaveScenario = "normal" | "save-failure"

export type ProjectSaveResult =
  | { kind: "saved"; projectId: string }
  | { kind: "invalid"; errors: ProjectFieldErrors }
  | { kind: "rejected"; message: string }

export function validateProjectFields(
  values: Pick<NewProject, "name" | "dueDate">,
): ProjectFieldErrors {
  const date = new Date(`${values.dueDate}T00:00:00Z`)

  const validDate =
    Number.isFinite(date.getTime()) &&
    date.toISOString().slice(0, 10) === values.dueDate

  return {
    name: values.name.trim() ? undefined : "Enter a project name.",
    dueDate: validDate ? undefined : "Choose a valid due date.",
  }
}

export function validateProjectValues(
  values: ProjectValues,
  members: Member[],
): ProjectFieldErrors {
  const links: Record<string, string> = {}

  for (const link of values.links) {
    const error = projectLinkError(link)

    if (error) links[link.id] = error
  }

  return {
    ...validateProjectFields(values),
    ownerId: members.some((member) => member.id === values.ownerId)
      ? undefined
      : "Choose a workspace member.",
    links: Object.keys(links).length ? links : undefined,
  }
}

export function projectValues(project: Project): ProjectValues {
  return {
    name: project.name,
    description: project.description,
    dueDate: project.dueDate,
    ownerId: project.ownerId,
    tags: project.tags,
    links: project.links,
  }
}

export function projectValuesChanged(a: ProjectValues, b: ProjectValues) {
  return (
    a.name !== b.name ||
    !sameDocument(a.description, b.description) ||
    a.ownerId !== b.ownerId ||
    a.dueDate !== b.dueDate ||
    JSON.stringify(a.tags) !== JSON.stringify(b.tags) ||
    !sameProjectLinks(a.links, b.links)
  )
}
