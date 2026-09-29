import { documentText } from "@/kit/rich-text/document"
import type { InboxEntry } from "./inbox"
import type { Member, Project, ProjectComment, ProjectTask } from "./model"
import { commentText } from "./project-comments"

export const searchKinds = {
  project: "Projects",
  task: "Tasks",
  comment: "Comments",
  message: "Messages",
  person: "People",
} as const

export type SearchKind = keyof typeof searchKinds

export interface SearchHit {
  kind: SearchKind
  id: string
  title: string
  detail: string
  /** The project a task or comment belongs to, for linking. */
  projectId?: string
}

export interface SearchSources {
  projects: Project[]
  tasks: ProjectTask[]
  comments: ProjectComment[]
  messages: InboxEntry[]
  people: (Member & { email?: string })[]
}

export function searchTerms(query: string) {
  return query.trim().toLowerCase().split(/\s+/u).filter(Boolean)
}

/** Every term must appear; hits whose title matches rank first. */
function matches<T>(
  items: T[],
  terms: string[],
  title: (item: T) => string,
  body: (item: T) => string,
) {
  return items
    .flatMap((item) => {
      const heading = title(item).toLowerCase()
      const text = `${heading} ${body(item).toLowerCase()}`

      return terms.every((term) => text.includes(term))
        ? [
            {
              item,
              rank: terms.every((term) => heading.includes(term)) ? 0 : 1,
            },
          ]
        : []
    })
    .sort((a, b) => a.rank - b.rank)
    .map(({ item }) => item)
}

export function searchWorkspace(
  query: string,
  sources: SearchSources,
): SearchHit[] {
  const terms = searchTerms(query)

  if (terms.length === 0) return []

  const projectName = (id: string) =>
    sources.projects.find((project) => project.id === id)?.name ??
    "Project unavailable"

  const personName = (id: string) =>
    sources.people.find((person) => person.id === id)?.name ?? "Former member"

  return [
    ...matches(
      sources.projects,
      terms,
      (project) => project.name,
      (project) =>
        `${documentText(project.description)} ${project.tags.join(" ")}`,
    ).map((project) => ({
      kind: "project" as const,
      id: project.id,
      title: project.name,
      detail: documentText(project.description),
      projectId: project.id,
    })),
    ...matches(
      sources.tasks,
      terms,
      (task) => task.title,
      () => "",
    ).map((task) => ({
      kind: "task" as const,
      id: task.id,
      title: task.title,
      detail: `${projectName(task.projectId)} · ${task.done ? "Done" : "Open"}`,
      projectId: task.projectId,
    })),
    ...matches(
      sources.comments,
      terms,
      () => "",
      (comment) => commentText(comment.body, sources.people),
    ).map((comment) => ({
      kind: "comment" as const,
      id: comment.id,
      title: `${personName(comment.authorId)} on ${projectName(comment.projectId)}`,
      detail: commentText(comment.body, sources.people),
      projectId: comment.projectId,
    })),
    ...matches(
      sources.messages,
      terms,
      (entry) => entry.title,
      (entry) => entry.posts.map((post) => post.body).join(" "),
    ).map((entry) => ({
      kind: "message" as const,
      id: entry.id,
      title: entry.title,
      detail: entry.posts[entry.posts.length - 1].body,
    })),
    ...matches(
      sources.people,
      terms,
      (person) => person.name,
      (person) => person.email ?? "",
    ).map((person) => ({
      kind: "person" as const,
      id: person.id,
      title: person.name,
      detail: person.email ?? "",
    })),
  ]
}
