import type { Activity, Project } from "./model"
import { dateOffset } from "./report-period"

export interface TimelineRow {
  project: Project
  start: string
  end: string
}

/**
 * A project's span runs from its first recorded activity to its due date. A
 * project with no history yet starts on the snapshot date.
 */
export function timelineRows(
  projects: Project[],
  activity: Activity[],
  reference: string,
): TimelineRow[] {
  const first = new Map<string, string>()

  for (const event of activity) {
    const known = first.get(event.projectId)

    if (!known || event.date < known) first.set(event.projectId, event.date)
  }

  return projects.map((project) => {
    const start = first.get(project.id) ?? reference

    return {
      project,
      start: start < project.dueDate ? start : project.dueDate,
      end: project.dueDate,
    }
  })
}

export function daysBetween(from: string, to: string) {
  return Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
      86_400_000,
  )
}

/** The Monday on or before a date. */
export function weekStart(date: string) {
  const day = new Date(`${date}T00:00:00Z`).getUTCDay()

  return dateOffset(date, -((day + 6) % 7))
}

/** Whole weeks covering every row and the snapshot date. */
export function timelineRange(rows: TimelineRow[], reference: string) {
  const dates = [reference, ...rows.flatMap((row) => [row.start, row.end])]
  const start = weekStart(dates.reduce((a, b) => (a < b ? a : b)))
  const last = weekStart(dates.reduce((a, b) => (a > b ? a : b)))
  const days = daysBetween(start, last) + 7

  return {
    start,
    days,
    weeks: Array.from({ length: days / 7 }, (_, week) =>
      dateOffset(start, week * 7),
    ),
  }
}

/** Monday-first weeks for a "YYYY-MM" month, with days outside it marked. */
export function monthGrid(month: string) {
  const first = `${month}-01`
  const start = weekStart(first)
  const next = nextMonth(month, 1)
  const days = daysBetween(start, weekStart(dateOffset(`${next}-01`, -1))) + 7

  return Array.from({ length: days }, (_, index) => {
    const date = dateOffset(start, index)

    return { date, inMonth: date.startsWith(month) }
  })
}

export function nextMonth(month: string, offset: 1 | -1) {
  const [year, value] = month.split("-").map(Number)
  const date = new Date(Date.UTC(year, value - 1 + offset, 1))

  return date.toISOString().slice(0, 7)
}
