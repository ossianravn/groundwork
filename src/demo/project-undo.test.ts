import { textDocument } from "@/kit/rich-text/document"
import { expect, it } from "vitest"
import { applyProjectBulkChange } from "./project-bulk"
import { captureProjectUndo, revertProjectChange } from "./project-undo"
import { applyTaskChange } from "./project-tasks"
import type { Project, ProjectTask } from "./model"

const project: Project = {
  id: "brand",
  name: "Brand refresh",
  code: "BR",
  color: "violet",
  description: textDocument("Brand guidelines"),
  tags: [],
  links: [],
  status: "in-progress",
  ownerId: "ava",
  dueDate: "2026-09-28",
  tasks: 3,
  completedTasks: 1,
}

const tasks: ProjectTask[] = [
  {
    id: "t1",
    projectId: "brand",
    title: "Logo",
    done: true,
    assigneeId: "ava",
  },
  {
    id: "t2",
    projectId: "brand",
    title: "Palette",
    done: false,
    assigneeId: null,
  },
  {
    id: "t3",
    projectId: "brand",
    title: "Type",
    done: false,
    assigneeId: "leo",
  },
]

const context = {
  members: [],
  memberId: "ava",
  date: "2026-09-24",
  eventId: () => crypto.randomUUID(),
  rejectedIds: [],
}

it("reverts a completion, its tasks and activity, but keeps later edits to other projects", () => {
  const other = {
    ...project,
    id: "other",
    status: "completed" as const,
    tasks: 0,
    completedTasks: 0,
  }

  const before = { projects: [project, other], activity: [], tasks }

  const { records } = applyProjectBulkChange(
    before,
    ["brand", "other"],
    { kind: "complete" },
    context,
  )

  expect(records.tasks.every((task) => task.done)).toBe(true)

  const undo = captureProjectUndo(before, records)

  expect(undo?.changes.map((change) => change.before.id)).toEqual(["brand"])
  expect(undo?.eventIds).toHaveLength(1)

  const reverted = revertProjectChange(records, undo!)

  expect(reverted.projects[0]).toBe(project)
  expect(reverted.tasks).toEqual(tasks)
  expect(reverted.activity).toEqual([])

  const renamed = {
    ...records,
    projects: records.projects.map((item) => ({ ...item, name: "Renamed" })),
  }

  expect(revertProjectChange(renamed, undo!).projects[0].name).toBe("Renamed")
  expect(captureProjectUndo(records, records)).toBeNull()
})

it("restores a removed task at its place and its project's counts", () => {
  const before = { projects: [project], activity: [], tasks }
  const task = { id: () => "new", memberId: "ava", date: "2026-09-24" }
  const after = applyTaskChange(before, { kind: "remove", taskId: "t2" }, task)

  expect(after.projects[0].tasks).toBe(2)

  const reverted = revertProjectChange(
    after,
    captureProjectUndo(before, after)!,
  )

  expect(reverted.tasks.map((item) => item.id)).toEqual(["t1", "t2", "t3"])
  expect(reverted.projects[0]).toEqual(project)
})
