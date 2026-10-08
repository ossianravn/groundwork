import script from "../data/assistant.json"
import { formatDate, statusLabels, type Project } from "../model"
import type {
  AssistantContext,
  AssistantReply,
  ChooseProjectInput,
} from "./assistant-types"

export const projectPath = (project: Project) =>
  `/app/demo/projects/${encodeURIComponent(project.id)}`

export const projectLink = (project: Project) =>
  `[${project.name}](${projectPath(project)})`

export const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`

/** Names in a sentence: A, B and C. */
export const inWords = (names: string[]) =>
  names.length > 1
    ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`
    : (names[0] ?? "")

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

/**
 * Asks which open project a request is for, through the client-side
 * chooseProject tool; `purpose` tells the continuation what to do next.
 */
export function askForProject(
  context: AssistantContext,
  purpose: ChooseProjectInput["purpose"],
  lead: string,
): Omit<AssistantReply, "followUps"> {
  return {
    text: lead,
    question: {
      purpose,
      question: script.questions[purpose],
      options: context.projects
        .filter((project) => project.status !== "completed")
        .map((project) => ({
          value: project.id,
          label: project.name,
          description: `due ${formatDate(project.dueDate)}`,
        })),
    },
  }
}
