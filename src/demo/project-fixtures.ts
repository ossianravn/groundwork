import data from "./data/projects.json"
import { textDocument } from "@/kit/rich-text/document"
import type { Project } from "./model"

export const initialProjects = data.map((project): Project => {
  const status = project.status

  if (
    status !== "in-progress" &&
    status !== "in-review" &&
    status !== "completed"
  ) {
    throw new Error(`Unknown project status: ${status}`)
  }

  return { ...project, status, description: textDocument(project.description) }
})
