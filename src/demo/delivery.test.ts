import { expect, it } from "vitest"
import workspace from "./data/workspace.json"
import { initialActivity } from "./activity-fixtures"
import { initialTasks } from "./project-tasks"
import {
  bucketOf,
  deliverySeries,
  deliveryTotals,
  previousWindow,
} from "./delivery"
import { reportWindow } from "./report-period"

const days = (count: 7 | 14 | 30 | 90) =>
  reportWindow(workspace.referenceDate, { kind: "preset", days: count })

it("reads a month by day and longer ranges by week", () => {
  expect(bucketOf(days(30))).toBe("day")
  expect(bucketOf(days(90))).toBe("week")

  const weeks = deliverySeries(initialActivity, initialTasks, days(90))

  // The first bucket starts with the window, not the Monday before it.
  expect(weeks[0].date).toBe(days(90).start)
  expect(
    weeks.slice(1).every((week) => new Date(week.date).getUTCDay() === 1),
  ).toBe(true)
})

it("agrees with the window's totals, whatever the bucket", () => {
  for (const window of [days(14), days(90)]) {
    const series = deliverySeries(initialActivity, initialTasks, window)
    const totals = deliveryTotals(initialActivity, initialTasks, window)

    expect(series.reduce((sum, point) => sum + point.completed, 0)).toBe(
      totals.completed,
    )
    expect(series.reduce((sum, point) => sum + point.added, 0)).toBe(
      totals.added,
    )
    expect(
      series.every((point) => point.net === point.added - point.completed),
    ).toBe(true)
  }

  expect(
    deliveryTotals(initialActivity, initialTasks, days(14)).completed,
  ).toBe(68)
})

it("compares with the window of the same length just before", () => {
  expect(previousWindow(days(7))).toEqual({
    start: "2026-09-11",
    end: "2026-09-17",
  })
})

it("takes the median days from adding to completing", () => {
  const tasks = [
    { createdAt: "2026-09-01", completedAt: "2026-09-03" },
    { createdAt: "2026-09-01", completedAt: "2026-09-05" },
    { createdAt: "2026-09-02", completedAt: "2026-09-05" },
  ].map((dates, index) => ({
    id: `t${index}`,
    projectId: "p",
    title: "Task",
    done: true,
    assigneeId: null,
    ...dates,
  }))

  const window = { start: "2026-09-01", end: "2026-09-07" }

  expect(deliveryTotals([], tasks, window).cycle).toBe(3)
  expect(
    deliverySeries([], tasks, window).find((day) => day.date === "2026-09-05")
      ?.cycle,
  ).toBe(3.5)
})
