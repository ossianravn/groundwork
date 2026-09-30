import { formatDate, statusLabels, type Project } from "../model"
import type { AssistantContext } from "./assistant-types"

export const projectPath = (project: Project) =>
  `/app/demo/projects/${encodeURIComponent(project.id)}`

export const projectLink = (project: Project) =>
  `[${project.name}](${projectPath(project)})`

export const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`

/** A citation in reply markdown; the assistant view renders it inline. */
export const citation = (number: number, ids: string[]) =>
  `[${number}](#source:${ids.join(",")})`

export function daysBetween(from: string, to: string) {
  return Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
      86_400_000,
  )
}

export function personName(context: AssistantContext, id: string) {
  return (
    context.people.find((person) => person.id === id)?.name ?? "A former member"
  )
}

/** Describes a project for a source list: status, due date and open work. */
export function projectSummary(project: Project) {
  const open = project.tasks - project.completedTasks

  return `${statusLabels[project.status]} · due ${formatDate(project.dueDate)} · ${open} of ${project.tasks} tasks open`
}
