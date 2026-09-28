import data from "./data/projects.json"
import { textDocument } from "@/kit/rich-text/document"
import type { Project } from "./model"
import { isProjectColor } from "./project-colors"

export const initialProjects = data.map((project): Project => {
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
  }
})
