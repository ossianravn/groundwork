import { expect, it } from "vitest"
import { initialProjects } from "@/demo/project-fixtures"
import {
  emptyProjectFilters,
  filterProjects,
} from "@/features/overview/project-filtering"
import {
  matchesProjectQuery,
  parseProjectQuery,
  type ProjectQuery,
} from "./project-query"

it("combines all/any rules with quick facets and scopes alternative counts to the advanced group", () => {
  const advanced: ProjectQuery = {
    match: "all",
    conditions: [
      { field: "progress", operator: "atLeast", value: 75 },
      { field: "status", operator: "isNot", value: "completed" },
    ],
  }

  const all = filterProjects(initialProjects, {
    ...emptyProjectFilters,
    advanced,
  })

  expect(all.rows.map((project) => project.id)).toEqual(["brand", "mobile"])

  const any = filterProjects(initialProjects, {
    query: "a",
    statuses: ["in-progress"],
    owners: [],
    advanced: { ...advanced, match: "any" },
  })

  expect(any.rows.map((project) => project.id)).toEqual(["brand"])
  expect(Object.fromEntries(any.statusCounts)).toEqual({
    "in-progress": 1,
    "in-review": 1,
    completed: 2,
  })
  expect(Object.fromEntries(any.ownerCounts)).toEqual({ ava: 1 })
  expect(
    filterProjects(initialProjects, {
      ...emptyProjectFilters,
      owners: ["leo"],
      advanced,
    }).rows,
  ).toEqual([])
})

it("matches visible rounded progress and exact date boundaries, including a project without tasks", () => {
  const website = initialProjects[1]

  const query: ProjectQuery = {
    match: "all",
    conditions: [
      { field: "progress", operator: "equals", value: 44 },
      { field: "dueDate", operator: "onOrBefore", value: "2026-10-08" },
      { field: "name", operator: "contains", value: "WEBSITE" },
      { field: "owner", operator: "is", value: "leo" },
    ],
  }

  expect(matchesProjectQuery(website, query)).toBe(true)
  expect(
    matchesProjectQuery(website, {
      match: "all",
      conditions: [
        { field: "dueDate", operator: "before", value: "2026-10-08" },
      ],
    }),
  ).toBe(false)
  expect(
    matchesProjectQuery(
      { ...website, tasks: 0, completedTasks: 0 },
      {
        match: "all",
        conditions: [{ field: "progress", operator: "equals", value: 0 }],
      },
    ),
  ).toBe(true)
})

it("rejects malformed groups as a whole and preserves valid owner IDs outside the original fixtures", () => {
  const owner = { field: "owner", operator: "is", value: "new-member" }
  expect(
    parseProjectQuery({ match: "all", conditions: [owner] })?.conditions,
  ).toEqual([owner])

  for (const invalid of [
    { field: "dueDate", operator: "on", value: "2026-02-30" },
    { field: "progress", operator: "atLeast", value: 101 },
    { field: "progress", operator: "atLeast", value: "" },
    { field: "name", operator: "contains", value: "  " },
    { field: "status", operator: "before", value: "completed" },
  ]) {
    expect(
      parseProjectQuery({ match: "all", conditions: [owner, invalid] }),
    ).toBeUndefined()
  }

  expect(parseProjectQuery({ match: "all", conditions: [] })).toBeUndefined()
})
