import { textDocument } from "@/kit/rich-text/document"
import { expect, it } from "vitest"
import { applyProjectBulkChange } from "./project-bulk"
import { captureProjectUndo, revertProjectChange } from "./project-undo"
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
  members: [],
  memberId: "ava",
  date: "2026-09-24",
  eventId: () => crypto.randomUUID(),
  rejectedIds: [],
}

it("reverts a completion and its activity, but keeps later edits to other projects", () => {
  const other = { ...project, id: "other", status: "completed" as const }
  const before = { projects: [project, other], activity: [] }

  const { records } = applyProjectBulkChange(
    before,
    ["brand", "other"],
    { kind: "complete" },
    context,
  )

  const undo = captureProjectUndo(before, records)

  expect(undo?.changes.map((change) => change.before.id)).toEqual(["brand"])
  expect(undo?.eventIds).toHaveLength(1)

  const reverted = revertProjectChange(records, undo!)

  expect(reverted.projects[0]).toBe(project)
  expect(reverted.activity).toEqual([])

  const renamed = {
    ...records,
    projects: records.projects.map((item) => ({ ...item, name: "Renamed" })),
  }

  expect(revertProjectChange(renamed, undo!).projects[0].name).toBe("Renamed")
  expect(captureProjectUndo(records, records)).toBeNull()
})
