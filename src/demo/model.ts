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
  tasks: number
  completedTasks: number
  tags: string[]
  links: ProjectLink[]
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
