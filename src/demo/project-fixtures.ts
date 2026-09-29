import data from "./data/projects.json"
import { textDocument } from "@/kit/rich-text/document"
import type { Project } from "./model"
import { isProjectColor } from "./project-colors"
import { initialTasks, withTaskCounts } from "./project-tasks"

const projects = data.map((project): Project => {
  const status = project.status

  if (
    status !== "in-progress" &&
    status !== "in-review" &&
    status !== "completed"
  ) {
    throw new Error(`Unknown project status: ${status}`)
  }

  if (!isProjectColor(project.color)) {
    throw new Error(`Unknown project color: ${project.color}`)
  }

  return {
    ...project,
    status,
    color: project.color,
    description: textDocument(project.description),
    tasks: 0,
    completedTasks: 0,
  }
})

// Task counts come from the task fixtures, not a second stored figure.
export const initialProjects = withTaskCounts(projects, initialTasks)
