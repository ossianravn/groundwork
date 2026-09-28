import { expect, it } from "vitest"
import { parseSearchWith, stringifySearchWith } from "@tanstack/react-router"
import {
  parseProjectsSearch,
  defaultProjectsSearch,
  projectTableSearch,
  projectTableState,
} from "./projects-search"
import { boundedProjectPage } from "@/features/overview/project-table-state"
import { projectReturnDestination } from "./project-return"

it.each(["grid", "board"])(
  "round-trips a shared %s results page through the Router URL codec",
  (view) => {
    const search = parseProjectsSearch({
      view,
      q: "Design & brand",
      status: ["in-review", "in-progress"],
      owner: ["noah", "ava"],
      sort: "dueDate",
      desc: true,
      page: 2,
      pageSize: 10,
      advanced: {
        match: "any",
        conditions: [
          { field: "progress", operator: "atLeast", value: 75 },
          { field: "dueDate", operator: "before", value: "2026-10-01" },
        ],
      },
    })

    const url = stringifySearchWith(JSON.stringify)(search)
    const restored = parseProjectsSearch(parseSearchWith(JSON.parse)(url))

    expect(restored).toEqual(search)
    expect(projectTableSearch(projectTableState(restored))).toEqual(search)
    expect(projectReturnDestination(`/app/demo/projects${url}`).search).toEqual(
      search,
    )

    const cleared = projectTableSearch({
      ...projectTableState(restored),
      filters: { query: "", statuses: [], owners: [] },
    })

    expect(
      parseProjectsSearch({ ...restored, ...cleared }).advanced,
    ).toBeUndefined()
  },
)

it("resolves malformed query choices and out-of-range pages to usable results", () => {
  const search = parseProjectsSearch({
    view: "unknown",
    status: ["completed", "missing", "completed", 42],
    owner: "ava,missing",
    sort: "actions",
    desc: true,
    page: -8,
    pageSize: 99,
  })

  expect(search).toMatchObject({
    view: "table",
    status: ["completed"],
    owner: ["ava"],
    sort: undefined,
    desc: false,
    page: 1,
    pageSize: 5,
  })
  expect(boundedProjectPage(9, 5, 6)).toBe(1)
  expect(boundedProjectPage(1, 5, 0)).toBe(0)
  expect(parseProjectsSearch({ q: { toString: null } })).toEqual(
    defaultProjectsSearch,
  )
})
