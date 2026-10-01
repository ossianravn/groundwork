import { expect, it } from "vitest"
import {
  parseProjectReturnSearch,
  projectReturnDestination,
  projectReturnTo,
  resultsLocationKey,
} from "./project-return"

it("returns to the same results independently of inspection, defaults and query ordering", () => {
  const origin =
    "/app/demo/projects?status=%5B%22in-progress%22%5D&owner=ava&sort=dueDate&desc=true&page=2&inspect=brand-refresh"

  const destination = projectReturnDestination(origin)
  expect(destination).toMatchObject({
    to: "/app/demo/projects",
    search: {
      status: ["in-progress"],
      owner: ["ava"],
      sort: "dueDate",
      desc: true,
      page: 2,
    },
  })
  expect(projectReturnTo(origin)).not.toContain("inspect")
  expect(resultsLocationKey(origin)).toEqual(
    resultsLocationKey(
      "/app/demo/projects?page=2&desc=true&sort=dueDate&owner=ava&status=in-progress&pageSize=10",
    ),
  )
  expect(
    projectReturnDestination(
      "/app/demo/overview?period=30&inspect=brand-refresh#activity",
    ),
  ).toEqual({
    to: "/app/demo/overview",
    search: { period: 30 },
    hash: "activity",
  })
})

it("gives direct, invalid and unrelated destinations a usable Projects return", () => {
  for (const origin of [
    undefined,
    {},
    "https://other.test/app/demo/projects",
    "/app/demo/projects/missing",
    "//other.test",
  ]) {
    expect(parseProjectReturnSearch({ returnTo: origin }).returnTo).toBe(
      "/app/demo/projects",
    )
  }
})

it("preserves the inbox message and filter through a project visit", () => {
  const origin = "/app/demo/inbox?message=mobile-review&filter=unread"
  expect(projectReturnDestination(origin)).toEqual({
    to: "/app/demo/inbox",
    search: { message: "mobile-review", filter: "unread", scenario: "normal" },
    hash: "",
  })
  expect(resultsLocationKey(origin)).toEqual(
    resultsLocationKey("/app/demo/inbox?filter=unread&message=mobile-review"),
  )
})

it("preserves Analytics scope and the project data view through a project visit", () => {
  const origin = "/app/demo/analytics?period=7&project=brand&projectView=data"
  expect(projectReturnDestination(origin)).toEqual({
    to: "/app/demo/analytics",
    search: {
      period: 7,
      project: "brand",
      projectView: "data",
      compare: false,
    },
    hash: "",
  })
  expect(
    projectReturnDestination("/app/demo/analytics?period=invalid").search,
  ).toEqual({
    period: 30,
    project: "",
    projectView: "chart",
    compare: false,
  })
})

it("returns to the assistant from a project opened in a reply", () => {
  expect(projectReturnDestination("/app/demo/assistant")).toEqual({
    to: "/app/demo/assistant",
    search: { scenario: "normal", q: "" },
    hash: "",
  })
})
