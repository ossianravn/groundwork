import { expect, it } from "vitest"
import { initialProjects } from "./project-fixtures"
import { initialActivity } from "./activity-fixtures"
import {
  daysBetween,
  monthGrid,
  nextMonth,
  timelineRange,
  timelineRows,
  weekStart,
} from "./project-timeline"

it("spans each project from its first activity to its due date", () => {
  const rows = timelineRows(initialProjects, initialActivity, "2026-09-24")
  const brand = rows.find((row) => row.project.id === "brand")!

  expect(brand).toMatchObject({ start: "2026-08-05", end: "2026-09-28" })

  const fresh = timelineRows(
    [{ ...initialProjects[0], id: "new", dueDate: "2026-10-30" }],
    [],
    "2026-09-24",
  )

  expect(fresh[0]).toMatchObject({ start: "2026-09-24", end: "2026-10-30" })
})

it("covers whole Monday-first weeks including the snapshot date", () => {
  const rows = timelineRows(initialProjects, initialActivity, "2026-09-24")
  const range = timelineRange(rows, "2026-09-24")

  expect(weekStart("2026-09-24")).toBe("2026-09-21")
  expect(range.start).toBe("2026-07-13")
  expect(range.days % 7).toBe(0)
  expect(range.weeks[0]).toBe("2026-07-13")
  expect(daysBetween(range.start, "2026-10-16")).toBeLessThan(range.days)
})

it("lays out a month from Monday with neighbouring days marked", () => {
  const days = monthGrid("2026-09")

  expect(days[0]).toEqual({ date: "2026-08-31", inMonth: false })
  expect(days.filter((day) => day.inMonth)).toHaveLength(30)
  expect(days.length % 7).toBe(0)
  expect(days.at(-1)?.date).toBe("2026-10-04")
  expect(nextMonth("2026-12", 1)).toBe("2027-01")
  expect(nextMonth("2026-01", -1)).toBe("2025-12")
})
