import { expect, it } from "vitest"
import { initialProjects } from "./project-fixtures"
import {
  addProjectTasks,
  applyTaskChange,
  initialTasks,
  type TaskRecords,
} from "./project-tasks"

const context = { id: () => "new", memberId: "ava", date: "2026-09-24" }

function records(): TaskRecords {
  return { projects: initialProjects, activity: [], tasks: initialTasks }
}

function brand(result: TaskRecords) {
  return result.projects.find((project) => project.id === "brand")!
}

it("derives each project's counts from its task fixtures", () => {
  expect(
    initialProjects.map((project) => [
      project.id,
      project.completedTasks,
      project.tasks,
    ]),
  ).toEqual([
    ["brand", 24, 32],
    ["website", 21, 48],
    ["mobile", 36, 40],
    ["design-system", 18, 56],
    ["onboarding", 24, 24],
    ["launch", 18, 18],
  ])
})

it("records a completion once and removes it when reopened the same day", () => {
  const open = initialTasks.find(
    (task) => task.projectId === "brand" && !task.done,
  )!

  const done = applyTaskChange(
    records(),
    { kind: "toggle", taskId: open.id },
    context,
  )

  expect(brand(done).completedTasks).toBe(25)
  expect(done.activity).toMatchObject([
    { projectId: "brand", tasksCompleted: 1, kind: "tasks", taskId: open.id },
  ])

  const reopened = applyTaskChange(
    done,
    { kind: "toggle", taskId: open.id },
    context,
  )

  expect(brand(reopened).completedTasks).toBe(24)
  expect(reopened.activity).toEqual([])
})

it("adds at the end of the project, moves among open tasks and ignores completed projects", () => {
  const added = applyTaskChange(
    records(),
    {
      kind: "add",
      projectId: "brand",
      title: "  Press kit  ",
      assigneeId: null,
    },
    context,
  )

  const own = added.tasks.filter((task) => task.projectId === "brand")

  expect(own.at(-1)).toMatchObject({
    id: "new",
    title: "Press kit",
    done: false,
  })
  expect(brand(added).tasks).toBe(33)

  const moved = applyTaskChange(
    added,
    { kind: "move", taskId: "new", offset: -1 },
    context,
  )

  const open = moved.tasks.filter(
    (task) => task.projectId === "brand" && !task.done,
  )

  expect(open.slice(-2).map((task) => task.id)).toEqual(["new", "brand-t32"])

  const launch = initialTasks.find((task) => task.projectId === "launch")!

  expect(
    applyTaskChange(records(), { kind: "remove", taskId: launch.id }, context),
  ).toEqual(records())
})

it("adds several tasks to a project in order, and none to a completed one", () => {
  const tasks = [
    { title: "First", assigneeId: "ava" },
    { title: "Second", assigneeId: null },
  ]

  let next = 0
  const ids = { ...context, id: () => `batch-${(next += 1)}` }
  const result = addProjectTasks(records(), "brand", tasks, ids)
  const own = result.records.tasks.filter((task) => task.projectId === "brand")

  expect(result.added).toBe(2)
  expect(own.slice(-2).map((task) => task.title)).toEqual(["First", "Second"])
  expect(brand(result.records).tasks).toBe(brand(records()).tasks + 2)
  expect(addProjectTasks(records(), "launch", tasks, ids).added).toBe(0)
})
