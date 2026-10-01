import { expect, it } from "vitest"
import workspace from "./data/workspace.json"
import { initialActivity } from "./activity-fixtures"
import { initialProjects } from "./project-fixtures"
import { initialTasks } from "./project-tasks"
import { burnUp, openByMember, openByWeek, workByTag } from "./workload"

const reference = workspace.referenceDate

const project = (id: string) => {
  const found = initialProjects.find((item) => item.id === id)

  if (!found) throw new Error(`No project ${id}`)

  return found
}

it("splits open work in open projects by person, unassigned last", () => {
  const rows = openByMember(initialTasks, initialProjects, workspace.members)

  const open = initialTasks.filter(
    (task) => !task.done && project(task.projectId).status !== "completed",
  ).length

  expect(rows.reduce((sum, row) => sum + row.total, 0)).toBe(open)
  expect(rows.at(-1)?.name).toBe("Unassigned")

  for (const row of rows)
    expect(Object.values(row.projects).reduce((a, b) => a + b, 0)).toBe(
      row.total,
    )
})

it("counts open tasks at each week's end", () => {
  const weeks = openByWeek(initialTasks, {
    start: "2026-09-01",
    end: reference,
  })

  expect(weeks.at(-1)?.date).toBe(reference)
  expect(weeks.at(-1)?.brand).toBe(
    initialTasks.filter((task) => task.projectId === "brand" && !task.done)
      .length,
  )
})

it("burns up to today, then projects at the recent pace", () => {
  const brand = project("brand")
  const { points, finish } = burnUp(initialTasks, brand, reference)
  const today = points.find((point) => point.date === reference)

  expect(today).toMatchObject({
    scope: brand.tasks,
    done: brand.completedTasks,
  })
  expect(today?.projected).toBe(brand.completedTasks)
  // The projection runs to the due date, or a week past today if later.
  expect(points.at(-1)?.date).toBe([brand.dueDate, "2026-10-01"].sort()[1])
  expect(finish === null || (finish ?? "") > reference).toBe(true)
  expect(
    burnUp(initialTasks, project("launch"), reference).finish,
  ).toBeUndefined()
})

it("profiles members' completed work by project tag", () => {
  const rows = workByTag(initialActivity, initialProjects, ["ava", "leo"], {
    start: "2026-06-26",
    end: reference,
  })

  expect(rows.map((row) => row.tag)).toEqual([
    "Design",
    "Engineering",
    "Marketing",
    "Product",
    "Web",
  ])
  expect(rows.find((row) => row.tag === "Engineering")?.ava).toBe(0)
})
