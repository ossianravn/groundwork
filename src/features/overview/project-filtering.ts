import type { Project, ProjectStatus } from "@/demo/model"
import {
  matchesProjectQuery,
  type ProjectQuery,
} from "@/features/projects/project-query"

export interface ProjectFilters {
  query: string
  statuses: ProjectStatus[]
  owners: string[]
  advanced?: ProjectQuery
}

export const emptyProjectFilters: ProjectFilters = {
  query: "",
  statuses: [],
  owners: [],
}

export function filterProjects(projects: Project[], filters: ProjectFilters) {
  const query = filters.query.trim().toLowerCase()
  const rows: Project[] = []
  const statusCounts = new Map<ProjectStatus, number>()
  const ownerCounts = new Map<string, number>()

  for (const project of projects) {
    if (!project.name.toLowerCase().includes(query)) continue

    if (!matchesProjectQuery(project, filters.advanced)) continue

    const matchesStatus =
      filters.statuses.length === 0 || filters.statuses.includes(project.status)

    const matchesOwner =
      filters.owners.length === 0 || filters.owners.includes(project.ownerId)

    // Each facet counts matches under the other filters, excluding itself.
    if (matchesOwner) {
      statusCounts.set(
        project.status,
        (statusCounts.get(project.status) ?? 0) + 1,
      )
    }

    if (matchesStatus) {
      ownerCounts.set(
        project.ownerId,
        (ownerCounts.get(project.ownerId) ?? 0) + 1,
      )
    }

    if (matchesStatus && matchesOwner) rows.push(project)
  }

  return { rows, statusCounts, ownerCounts }
}
