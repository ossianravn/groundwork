import { textDocument } from "@/kit/rich-text/document"
import { expect, it } from "vitest"
import { applyProjectSave } from "./project-save"
import {
  projectValues,
  projectValuesChanged,
  validateProjectValues,
} from "./project-form"
import type { Project } from "./model"

const members = [{ id: "ava", name: "Ava Morgan", initials: "AM" }]

const project: Project = {
  id: "brand",
  name: "Brand refresh",
  code: "BR",
  description: textDocument("Original"),
  tags: [],
  links: [],
  status: "completed",
  ownerId: "ava",
  dueDate: "2026-09-28",
  tasks: 32,
  completedTasks: 32,
}

it("rejects missing names, impossible dates and unknown owners before accepting corrected fields", () => {
  expect(
    validateProjectValues(
      {
        name: "  ",
        description: textDocument(""),
        tags: [],
        links: [],
        ownerId: "missing",
        dueDate: "2026-02-30",
      },
      members,
    ),
  ).toEqual({
    name: "Enter a project name.",
    dueDate: "Choose a valid due date.",
    ownerId: "Choose a workspace member.",
  })
  expect(
    Object.values(
      validateProjectValues(
        {
          name: "New identity",
          description: textDocument(""),
          tags: [],
          links: [],
          ownerId: "ava",
          dueDate: "2026-10-20",
        },
        members,
      ),
    ).some(Boolean),
  ).toBe(false)
})

it("edits identity fields and adds one event while preserving task completion and other records", () => {
  const other = { ...project, id: "other" }

  const result = applyProjectSave(
    { projects: [project, other], activity: [] },
    { kind: "edit", id: project.id },
    {
      name: "  New identity  ",
      description: textDocument("Updated scope"),
      tags: [],
      links: [],
      ownerId: "leo",
      dueDate: "2026-10-20",
    },
    {
      projectId: project.id,
      eventId: "event",
      memberId: "ava",
      date: "2026-09-24",
    },
  )

  expect(result.projects[0]).toEqual({
    ...project,
    name: "New identity",
    code: "NI",
    description: textDocument("Updated scope"),
    tags: [],
    links: [],
    ownerId: "leo",
    dueDate: "2026-10-20",
  })
  expect(result.projects[1]).toBe(other)
  expect(result.activity).toEqual([
    {
      id: "event",
      projectId: "brand",
      memberId: "ava",
      date: "2026-09-24",
      action: "updated",
      tasksCompleted: 0,
      kind: "updated",
      changes: [
        { field: "name", before: project.name, after: "New identity" },
        {
          field: "description",
          before: project.description,
          after: textDocument("Updated scope"),
        },
        { field: "ownerId", before: project.ownerId, after: "leo" },
        { field: "dueDate", before: project.dueDate, after: "2026-10-20" },
      ],
    },
  ])
  expect(project.name).toBe("Brand refresh")
})

it("treats formatting-only edits as changes and preserves them in the saved record and history", () => {
  const before = projectValues(project)

  const formatted = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Original", marks: [{ type: "bold" }] },
        ],
      },
    ],
  }

  const after = { ...before, description: formatted }
  expect(
    projectValuesChanged(before, {
      ...before,
      description: textDocument("Original"),
      tags: [],
      links: [],
    }),
  ).toBe(false)
  expect(projectValuesChanged(before, after)).toBe(true)

  const result = applyProjectSave(
    { projects: [project], activity: [] },
    { kind: "edit", id: project.id },
    after,
    {
      projectId: project.id,
      eventId: "format-edit",
      memberId: "ava",
      date: "2026-09-27",
    },
  )

  expect(result.projects[0].description).toEqual(formatted)
  expect(result.activity[0].changes).toEqual([
    { field: "description", before: project.description, after: formatted },
  ])
  expect(projectValuesChanged(projectValues(result.projects[0]), after)).toBe(
    false,
  )
})
