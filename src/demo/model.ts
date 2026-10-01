import type { RichTextDocument } from "@/kit/rich-text/document"
import type { ActivityChange, ActivityKind } from "./activity"

export type ProjectStatus = "in-progress" | "in-review" | "completed"

/** A categorical hue token from the kit theme (`--hue-*`). */
export type ProjectColor =
  "violet" | "teal" | "amber" | "rose" | "green" | "sky"

export const projectStatuses: ProjectStatus[] = [
  "in-progress",
  "in-review",
  "completed",
]

export type Period = 7 | 14 | 30

export interface Member {
  id: string
  name: string
  initials: string
  avatar?: string
}

export interface Project {
  id: string
  name: string
  code: string
  color: ProjectColor
  description: RichTextDocument
  status: ProjectStatus
  ownerId: string
  dueDate: string
  /** Derived from the project's tasks; see project-tasks.ts. */
  tasks: number
  completedTasks: number
  tags: string[]
  links: ProjectLink[]
}

/** A task belongs to one project; its order is the order of the list. */
export interface ProjectTask {
  id: string
  projectId: string
  title: string
  done: boolean
  assigneeId: string | null
  /** The day it was added (ISO date), for created-versus-completed charts. */
  createdAt: string
  /** The day it was completed; absent while open. */
  completedAt?: string
  /** Optional details, shown when the task is opened. */
  description?: RichTextDocument
}

/** Mentions are stored as @{memberId} tokens in the body. */
export interface ProjectComment {
  id: string
  projectId: string
  authorId: string
  date: string
  body: string
}

/** A file attached to a project. Sample files without content have no url. */
export interface ProjectFile {
  id: string
  projectId: string
  name: string
  type: string
  size: number
  url: string | null
  uploadedBy: string
  date: string
}

export interface ProjectLink {
  id: string
  label: string
  url: string
}

export interface Activity {
  id: string
  projectId: string
  memberId: string
  date: string
  action: string
  tasksCompleted: number
  kind: ActivityKind
  changes?: ActivityChange[]
  /** Set when the event records one task's completion. */
  taskId?: string
}

export const statusLabels: Record<ProjectStatus, string> = {
  "in-progress": "In progress",
  "in-review": "In review",
  completed: "Completed",
}

export function formatDate(
  value: string,
  options?: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
    ...options,
  }).format(new Date(`${value}T00:00:00Z`))
}
