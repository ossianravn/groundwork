import { textDocument } from "@/kit/rich-text/document"
import { expect, it } from "vitest"
import type { Project } from "@/demo/model"
import { emptyProjectFilters, filterProjects } from "./project-filtering"

const base: Project = {
  id: "a",
  name: "Brand refresh",
  code: "BR",
  description: textDocument(""),
  tags: [],
  links: [],
  status: "in-progress",
  ownerId: "ava",
  dueDate: "2026-09-28",
  tasks: 10,
  completedTasks: 5,
}

const projects: Project[] = [
  base,
  { ...base, id: "b", name: "Brand review", status: "in-review" },
  { ...base, id: "c", name: "Brand launch", status: "completed" },
  { ...base, id: "d", name: "Brand system", ownerId: "leo" },
  { ...base, id: "e", name: "Website" },
]

it("combines choices within facets and intersects them with owners and normalized search", () => {
  const result = filterProjects(projects, {
    query: " BRAND ",
    statuses: ["in-progress", "in-review"],
    owners: ["ava"],
  })

  expect(result.rows.map((project) => project.id)).toEqual(["a", "b"])
  expect(Object.fromEntries(result.statusCounts)).toEqual({
    "in-progress": 1,
    "in-review": 1,
    completed: 1,
  })
  expect(Object.fromEntries(result.ownerCounts)).toEqual({ ava: 2, leo: 1 })
})

it("keeps alternative facet counts available with no matches and restores all rows when cleared", () => {
  const result = filterProjects(projects, {
    query: "",
    statuses: ["completed"],
    owners: ["leo"],
  })

  expect(result.rows).toEqual([])
  expect(Object.fromEntries(result.statusCounts)).toEqual({ "in-progress": 1 })
  expect(Object.fromEntries(result.ownerCounts)).toEqual({ ava: 1 })
  expect(filterProjects(projects, emptyProjectFilters).rows).toEqual(projects)
})
