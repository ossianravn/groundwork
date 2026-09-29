import { textDocument } from "@/kit/rich-text/document"
import { expect, it } from "vitest"
import { applyProjectBulkChange } from "./project-bulk"
import type { Project } from "./model"

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
  tasks: 32,
  completedTasks: 24,
}

const context = {
  members: [{ id: "leo", name: "Leo Chen", initials: "LC" }],
  memberId: "ava",
  date: "2026-09-24",
  eventId: () => crypto.randomUUID(),
  rejectedIds: [],
}

it("assigns only selected projects without changing progress or duplicating no-op events", () => {
  const other = { ...project, id: "other" }

  const changed = applyProjectBulkChange(
    { projects: [project, other], activity: [], tasks: [] },
    ["brand", "brand"],
    { kind: "assign", ownerId: "leo" },
    context,
  )

  expect(changed.records.projects).toEqual([
    { ...project, ownerId: "leo" },
    other,
  ])
  expect(changed.records.projects[1]).toBe(other)
  expect(changed.records.activity).toHaveLength(1)

  const repeated = applyProjectBulkChange(
    changed.records,
    ["brand"],
    { kind: "assign", ownerId: "leo" },
    context,
  )

  expect(repeated.result).toEqual({
    updated: [],
    unchanged: ["brand"],
    failed: [],
  })
  expect(repeated.records.activity).toHaveLength(1)
})

it("commits successful completions and retries failures without counting tasks twice", () => {
  const records = {
    projects: [
      project,
      { ...project, id: "website", name: "Website redesign" },
    ],
    activity: [],
    tasks: [],
  }

  const partial = applyProjectBulkChange(
    records,
    ["brand", "website"],
    { kind: "complete" },
    { ...context, rejectedIds: ["website"] },
  )

  expect(partial.result.updated).toEqual(["brand"])
  expect(partial.result.failed.map(({ id }) => id)).toEqual(["website"])
  expect(partial.records.projects[0]).toMatchObject({
    status: "completed",
    completedTasks: 32,
  })
  expect(partial.records.projects[1]).toBe(records.projects[1])

  const retried = applyProjectBulkChange(
    partial.records,
    ["brand", "website"],
    { kind: "complete" },
    context,
  )

  expect(retried.result).toEqual({
    updated: ["website"],
    unchanged: ["brand"],
    failed: [],
  })
  expect(retried.records.activity.map((event) => event.tasksCompleted)).toEqual(
    [8, 8],
  )
})

it("reports unavailable projects and invalid owners without corrupting records", () => {
  const records = { projects: [project], activity: [], tasks: [] }

  const changed = applyProjectBulkChange(
    records,
    ["brand", "missing"],
    { kind: "assign", ownerId: "unknown" },
    context,
  )

  expect(changed.result.failed.map(({ id }) => id).sort()).toEqual([
    "brand",
    "missing",
  ])
  expect(changed.records).toEqual(records)
})

it("moves and reopens projects without undoing or recounting completed tasks", () => {
  const reviewed = applyProjectBulkChange(
    { projects: [project], activity: [], tasks: [] },
    [project.id],
    { kind: "move", status: "in-review" },
    context,
  )

  expect(reviewed.records.projects[0]).toMatchObject({
    status: "in-review",
    completedTasks: 24,
  })

  const completed = applyProjectBulkChange(
    reviewed.records,
    [project.id],
    { kind: "move", status: "completed" },
    context,
  )

  const reopened = applyProjectBulkChange(
    completed.records,
    [project.id],
    { kind: "move", status: "in-progress" },
    context,
  )

  expect(reopened.records.projects[0]).toMatchObject({
    status: "in-progress",
    completedTasks: 32,
  })
  expect(reopened.records.activity.at(-1)?.action).toBe("reopened")

  const finishedAgain = applyProjectBulkChange(
    reopened.records,
    [project.id],
    { kind: "complete" },
    context,
  )

  const repeated = applyProjectBulkChange(
    finishedAgain.records,
    [project.id],
    { kind: "move", status: "completed" },
    context,
  )

  expect(
    repeated.records.activity.map((event) => event.tasksCompleted),
  ).toEqual([0, 8, 0, 0])
  expect(repeated.result.unchanged).toEqual([project.id])
})

it("keeps a rejected board move in its original column until retry succeeds", () => {
  const records = { projects: [project], activity: [], tasks: [] }
  const action = { kind: "move", status: "in-review" } as const

  const rejected = applyProjectBulkChange(records, [project.id], action, {
    ...context,
    rejectedIds: [project.id],
  })

  expect(rejected.records).toEqual(records)
  expect(rejected.result.failed[0]?.id).toBe(project.id)

  const retried = applyProjectBulkChange(
    rejected.records,
    [project.id],
    action,
    context,
  )

  expect(retried.records.projects[0].status).toBe("in-review")
  expect(retried.records.activity).toHaveLength(1)
})
