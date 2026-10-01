import { expect, it } from "vitest"
import workspace from "./data/workspace.json"
import { initialActivity } from "./activity-fixtures"
import { initialProjects } from "./project-fixtures"
import { initialTasks } from "./project-tasks"
import { projectSummary } from "./selectors"
import { snapshotHistory } from "./snapshot-history"

const reference = workspace.referenceDate

it("ends on today's snapshot figures", () => {
  const history = snapshotHistory(
    initialProjects,
    initialTasks,
    initialActivity,
    reference,
  )

  const { date, ...today } = history.at(-1) ?? { date: "" }

  expect(history).toHaveLength(30)
  expect(date).toBe(reference)
  expect(today).toEqual(projectSummary(initialProjects, reference))
})

it("counts a completed project as active until it finished", () => {
  const history = snapshotHistory(
    initialProjects,
    initialTasks,
    initialActivity,
    reference,
  )

  const before = history.find((day) => day.date === "2026-09-17")
  const after = history.find((day) => day.date === "2026-09-21")

  // Launch campaign finished on 18 Sept and onboarding on 20 Sept.
  expect(before?.completed).toBe(0)
  expect(after?.completed).toBe(2)
  expect((before?.active ?? 0) - (after?.active ?? 0)).toBe(2)
})
