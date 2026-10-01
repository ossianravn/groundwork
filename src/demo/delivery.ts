import type { Activity, ProjectTask } from "./model"
import { weekStart } from "./project-timeline"
import { dateOffset, windowDates, type ReportWindow } from "./report-period"

/** Days up to a month read as days; longer ranges as weeks. */
export type Bucket = "day" | "week"

export const bucketOf = (window: ReportWindow): Bucket =>
  windowDates(window).length > 31 ? "week" : "day"

export interface DeliveryPoint {
  /** The day, or the first day of the week inside the window. */
  date: string
  completed: number
  added: number
  /** Added minus completed: positive when the backlog grew. */
  net: number
  /** Median days from adding to completing, for tasks completed here. */
  cycle: number | null
}

/** The window of the same length that ends the day before this one. */
export function previousWindow(window: ReportWindow): ReportWindow {
  const days = windowDates(window).length

  return {
    start: dateOffset(window.start, -days),
    end: dateOffset(window.start, -1),
  }
}

function median(values: number[]) {
  if (!values.length) return null

  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)

  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2
}

const daysBetween = (from: string, to: string) =>
  Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
      86_400_000,
  )

/**
 * Delivery over a window, by day or week: tasks completed (from Activity,
 * as everywhere), tasks added, the net change in open work and the median
 * cycle time of the tasks completed. Scope to a project by passing only
 * its activity and tasks.
 */
export function deliverySeries(
  activity: Activity[],
  tasks: ProjectTask[],
  window: ReportWindow,
  bucket: Bucket = bucketOf(window),
): DeliveryPoint[] {
  const keyOf = (date: string) =>
    bucket === "day" ? date : [weekStart(date), window.start].sort()[1]

  const points = new Map<string, DeliveryPoint>()

  for (const date of windowDates(window)) {
    const key = keyOf(date)

    if (!points.has(key))
      points.set(key, {
        date: key,
        completed: 0,
        added: 0,
        net: 0,
        cycle: null,
      })
  }

  const cycles = new Map<string, number[]>()

  for (const event of activity) {
    const point = points.get(keyOf(event.date))

    if (point && event.date >= window.start && event.date <= window.end)
      point.completed += event.tasksCompleted
  }

  for (const task of tasks) {
    const added = points.get(keyOf(task.createdAt))

    if (added && task.createdAt >= window.start && task.createdAt <= window.end)
      added.added += 1

    const done = task.completedAt

    if (!done || done < window.start || done > window.end) continue

    const key = keyOf(done)

    cycles.set(key, [
      ...(cycles.get(key) ?? []),
      daysBetween(task.createdAt, done),
    ])
  }

  return [...points.values()].map((point) => ({
    ...point,
    net: point.added - point.completed,
    cycle: median(cycles.get(point.date) ?? []),
  }))
}

/** Totals over a window, for headings and the previous-period comparison. */
export function deliveryTotals(
  activity: Activity[],
  tasks: ProjectTask[],
  window: ReportWindow,
) {
  const completed = activity
    .filter((event) => event.date >= window.start && event.date <= window.end)
    .reduce((sum, event) => sum + event.tasksCompleted, 0)

  const added = tasks.filter(
    (task) => task.createdAt >= window.start && task.createdAt <= window.end,
  ).length

  const cycle = median(
    tasks.flatMap((task) =>
      task.completedAt &&
      task.completedAt >= window.start &&
      task.completedAt <= window.end
        ? [daysBetween(task.createdAt, task.completedAt)]
        : [],
    ),
  )

  return { completed, added, net: added - completed, cycle }
}
