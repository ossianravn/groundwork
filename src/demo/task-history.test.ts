import { expect, it } from "vitest"
import workspace from "./data/workspace.json"
import { initialActivity } from "./activity-fixtures"
import { initialProjects } from "./project-fixtures"
import { applyTaskChange, initialTasks } from "./project-tasks"
import { dateOffset } from "./report-period"

const key = (projectId: string, date: string) => `${projectId} ${date}`

it("dates every task, and its completions agree with Activity", () => {
  const fromTasks = new Map<string, number>()
  const fromActivity = new Map<string, number>()
  const earliest = dateOffset(workspace.referenceDate, -91)

  for (const task of initialTasks) {
    expect(task.createdAt >= earliest).toBe(true)
    expect(task.createdAt <= workspace.referenceDate).toBe(true)
    expect(Boolean(task.completedAt)).toBe(task.done)

    if (!task.completedAt) continue

    expect(task.createdAt < task.completedAt).toBe(true)

    const at = key(task.projectId, task.completedAt)

    fromTasks.set(at, (fromTasks.get(at) ?? 0) + 1)
  }

  for (const event of initialActivity) {
    if (!event.tasksCompleted) continue

    const at = key(event.projectId, event.date)

    fromActivity.set(at, (fromActivity.get(at) ?? 0) + event.tasksCompleted)
  }

  expect(Object.fromEntries(fromTasks)).toEqual(
    Object.fromEntries(fromActivity),
  )
})

it("records the day a task is added, completed or reopened", () => {
  const records = {
    projects: initialProjects,
    activity: initialActivity,
    tasks: initialTasks,
  }

  const context = { id: () => "new", memberId: "ava", date: "2026-09-24" }

  const open = initialTasks.find(
    (task) => task.projectId === "brand" && !task.done,
  )

  if (!open) throw new Error("Brand has no open task")

  const added = applyTaskChange(
    records,
    { kind: "add", projectId: "brand", title: "Press kit", assigneeId: null },
    context,
  )

  expect(added.tasks.find((task) => task.id === "new")?.createdAt).toBe(
    "2026-09-24",
  )

  const completed = applyTaskChange(
    records,
    { kind: "toggle", taskId: open.id },
    context,
  )

  const done = completed.tasks.find((task) => task.id === open.id)

  expect(done?.completedAt).toBe("2026-09-24")

  const reopened = applyTaskChange(
    completed,
    { kind: "toggle", taskId: open.id },
    context,
  ).tasks.find((task) => task.id === open.id)

  expect(reopened).toMatchObject({ done: false })
  expect(reopened && "completedAt" in reopened).toBe(false)
})
