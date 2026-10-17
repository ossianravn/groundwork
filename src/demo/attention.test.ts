import { expect, it } from "vitest"
import { needsAttention } from "./attention"
import { initialProjects } from "./project-fixtures"
import { initialTasks } from "./project-tasks"

const reference = "2026-09-24"

it("lists active projects that need someone, most urgent first", () => {
  const items = needsAttention(initialProjects, initialTasks, reference)

  expect(items.every((item) => item.project.status !== "completed")).toBe(true)
  expect(items.map((item) => item.rank)).toEqual(
    items.map((item) => item.rank).sort((a, b) => a - b),
  )
  expect(items.length).toBeGreaterThan(0)
})

it("calls a project overdue once its due date has passed", () => {
  const [project] = initialProjects

  const late = {
    ...project!,
    status: "in-progress" as const,
    dueDate: "2026-09-01",
  }

  const [item] = needsAttention([late], initialTasks, reference)

  expect(item?.rank).toBe(0)
  expect(item?.reasons[0]).toBe("Overdue since 1 Sept")
})

it("counts open tasks nobody owns", () => {
  const [project] = initialProjects

  const tasks = [
    {
      id: "t1",
      projectId: project!.id,
      title: "Unowned",
      done: false,
      assigneeId: null,
      createdAt: "2026-09-20",
    },
  ]

  const reasons = needsAttention(
    [{ ...project!, status: "in-progress", dueDate: "2026-12-01" }],
    tasks,
    reference,
  )[0]?.reasons

  expect(reasons).toContain("1 open task without an owner")
})
