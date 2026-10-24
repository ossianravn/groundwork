import type { LucideIcon } from "lucide-react"
import { searchTerms } from "@/demo/workspace-search"
import type { Member, Project } from "@/demo/model"

/** How many matches of each kind the menu lists; Search everything has all. */
const limit = 5

export interface CommandEntry {
  id: string
  label: string
  icon: LucideIcon
  /** Other words that find it, such as "create" for New project. */
  keywords?: string
}

export interface CommandTask {
  id: string
  title: string
  done: boolean
  projectId: string
  projectName: string
}

export interface CommandSources {
  projects: Project[]
  /** Most recent first. */
  recentProjectIds: string[]
  tasks: CommandTask[]
  people: Member[]
  pages: readonly CommandEntry[]
  actions: readonly CommandEntry[]
}

/**
 * What the command menu lists for a query. Before typing: recent projects
 * (or the first projects), actions and pages. Once typing: matching
 * projects (by name before tag, recent ones first), actions, pages, tasks
 * and people, each capped; every word must match, as on the Search page.
 */
export function commandResults(query: string, sources: CommandSources) {
  const terms = searchTerms(query)
  const typed = terms.length > 0

  const matches = (...texts: string[]) => {
    const text = texts.join(" ").toLowerCase()

    return terms.every((term) => text.includes(term))
  }

  const recent = sources.recentProjectIds.flatMap(
    (id) => sources.projects.find((project) => project.id === id) ?? [],
  )

  const projects = typed
    ? [
        ...recent,
        ...sources.projects.filter((project) => !recent.includes(project)),
      ]
        .filter((project) => matches(project.name, project.tags.join(" ")))
        // Names that match outrank tags that do; recent ones lead each.
        .sort((a, b) => Number(!matches(a.name)) - Number(!matches(b.name)))
        .slice(0, limit)
    : recent.length
      ? recent
      : sources.projects.slice(0, limit)

  const entries = (list: readonly CommandEntry[]) =>
    list.filter((entry) => matches(entry.label, entry.keywords ?? ""))

  return {
    typed,
    projectsHeading: !typed && recent.length ? "Recent" : "Projects",
    projects,
    actions: entries(sources.actions),
    pages: entries(sources.pages),
    tasks: typed
      ? sources.tasks.filter((task) => matches(task.title)).slice(0, limit)
      : [],
    people: typed
      ? sources.people.filter((person) => matches(person.name)).slice(0, limit)
      : [],
  }
}
