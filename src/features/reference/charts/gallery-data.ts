import type { ReactNode } from "react"
import workspace from "@/demo/data/workspace.json"
import { initialActivity } from "@/demo/activity-fixtures"
import { initialProjects } from "@/demo/project-fixtures"
import { initialTasks } from "@/demo/project-tasks"
import { completionBreakdown } from "@/demo/analytics"
import { deliverySeries } from "@/demo/delivery"
import { reportWindow, windowDates } from "@/demo/report-period"
import { burnUp, openByMember, openByWeek, workByTag } from "@/demo/workload"
import { formatDate, statusLabels } from "@/demo/model"
import { hueColor } from "@/kit/ui/chart-colors"
import { deliveryHistory } from "@/demo/integrations"
import { inPaletteOrder } from "@/features/analytics/palette-order"

/**
 * Sample data for the chart gallery, read from the demo's own fixtures, so
 * every preview shows the same workspace the product does.
 */
const reference = workspace.referenceDate

const window = (days: 14 | 30 | 90) =>
  reportWindow(reference, { kind: "preset", days })

/** A tick or tooltip label: Recharts passes either as a React node. */
export const dateTick = (value: ReactNode) => formatDate(String(value))

/** Tasks completed and added per day, last 14 days. */
export const daily = deliverySeries(initialActivity, initialTasks, window(14))

/** The same by week over 90 days. */
export const weekly = deliverySeries(initialActivity, initialTasks, window(90))

const breakdown = completionBreakdown(
  initialActivity,
  initialProjects,
  workspace.members,
  window(30),
  "",
)

const projectColor = (id: string) => {
  const color = initialProjects.find((project) => project.id === id)?.color

  return color ? hueColor(color) : "var(--muted-foreground)"
}

/** Completed tasks per project, last 30 days, with each project's hue. */
export const byProject = breakdown.projects.map((row) => ({
  ...row,
  fill: projectColor(row.id),
}))

const before = completionBreakdown(
  initialActivity,
  initialProjects,
  workspace.members,
  { start: "2026-07-27", end: "2026-08-25" },
  "",
).projects

/** The same, with the 30 days before for comparison. */
export const byProjectCompared = byProject.map((row) => ({
  ...row,
  previous: before.find((item) => item.id === row.id)?.completed ?? 0,
}))

/** Completed tasks per person, last 30 days. */
export const contributors = breakdown.contributors

/** Open projects with their hues, in the palette's order. */
export const openProjects = inPaletteOrder(
  initialProjects.filter((project) => project.status !== "completed"),
).map((project) => ({ ...project, fill: projectColor(project.id) }))

/** Open tasks per person now, split by project. */
export const load = openByMember(
  initialTasks,
  initialProjects,
  workspace.members,
).map((row) => ({ name: row.name, ...row.projects }))

/** Open tasks per project at each week's end, last 30 days. */
export const share = openByWeek(initialTasks, window(30))

/** Two people's completed work by project tag, last 90 days. */
export const tags = workByTag(
  initialActivity,
  initialProjects,
  ["ava", "leo"],
  window(90),
)

/** Website redesign's burn-up, with its projection. */
export const burn = burnUp(
  initialTasks,
  initialProjects[1] ?? initialProjects[0],
  reference,
).points

/** Projects by status. */
export const statuses = (
  ["in-progress", "in-review", "completed"] as const
).map((status) => ({
  status,
  name: statusLabels[status],
  count: initialProjects.filter((project) => project.status === status).length,
}))

/** Each project's share of tasks done. */
export const progress = initialProjects.map((project) => ({
  name: project.name,
  done: project.completedTasks,
  total: project.tasks,
  fill: projectColor(project.id),
}))

/** Webhook deliveries per day across endpoints, last 14 days. */
export const deliveries = deliveryHistory("project-sync").map((day) => {
  const other = deliveryHistory("reporting-hook").find(
    (item) => item.date === day.date,
  )

  return {
    date: day.date,
    delivered: day.delivered + (other?.delivered ?? 0),
    failed: day.failed + (other?.failed ?? 0),
  }
})

/** Completed tasks per day over the last 90 days, from Activity. */
export const completionsByDay = windowDates(window(90)).map((date) => ({
  date,
  value: initialActivity
    .filter((event) => event.date === date)
    .reduce((sum, event) => sum + event.tasksCompleted, 0),
}))
