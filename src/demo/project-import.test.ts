import { expect, it } from "vitest"
import {
  guessMapping,
  importDate,
  reviewImport,
  type ColumnMapping,
} from "./project-import"

const members = [
  { id: "ava", name: "Ava Morgan", initials: "AM" },
  { id: "leo", name: "Leo Chen", initials: "LC" },
]

const context = {
  members,
  emails: new Map([["leo", "leo@example.com"]]),
  defaultOwnerId: "ava",
  existingNames: ["Brand refresh"],
}

it("guesses columns from common header names", () => {
  expect(
    guessMapping(["Title", "Deadline", "Lead", "Labels", "Other"]),
  ).toEqual({ name: 0, dueDate: 1, owner: 2, tags: 3, description: null })
})

it("accepts ISO and UK dates only when they exist", () => {
  expect(importDate("2026-10-05")).toBe("2026-10-05")
  expect(importDate("5/10/2026")).toBe("2026-10-05")
  expect(importDate("31/02/2026")).toBeNull()
  expect(importDate("next week")).toBeNull()
})

it("reviews each row with its line, owner match and problems", () => {
  const mapping: ColumnMapping = {
    name: 0,
    owner: 1,
    dueDate: 2,
    description: null,
    tags: 3,
  }

  const rows = reviewImport(
    [
      ["Press kit", "leo@example.com", "2026-10-20", "Launch; PR ;Launch"],
      ["Brand refresh", "Leo", "01/11/2026", ""],
      ["", "Zoe", "soon", ""],
      ["Press kit", "", "2026-10-21", ""],
    ],
    mapping,
    context,
  )

  expect(rows[0]).toMatchObject({
    line: 2,
    ownerId: "leo",
    tags: ["Launch", "PR"],
    errors: [],
  })
  expect(rows[1].errors).toEqual([
    "A project called “Brand refresh” already exists.",
  ])
  expect(rows[2].errors).toEqual([
    "Add a project name.",
    "“soon” is not a date. Use YYYY-MM-DD.",
  ])
  expect(rows[2]).toMatchObject({
    ownerId: "ava",
    notes: ["No active member called “Zoe”; you will own it."],
  })
  expect(rows[3]).toMatchObject({ ownerId: "ava", line: 5 })
  expect(rows[3].errors).toEqual([
    "A project called “Press kit” already exists.",
  ])
})
