import { expect, it } from "vitest"
import { filterActivity } from "./activity"
import { initialActivity } from "./activity-fixtures"
import { parseActivitySearch } from "@/app/activity-search"
import { projectReturnDestination, projectReturnTo } from "@/app/project-return"

it("combines actor, event type, dates and text while preserving newest-first history", () => {
  const events = initialActivity.map((event) => ({ ...event, projectId: "p" }))
  const filters = { q: "AVA", member: "ava", kind: "tasks", period: 7 }
  const people = [{ id: "ava", name: "Ava Morgan", initials: "AM" }]
  const result = filterActivity(events, [], people, filters, "2026-09-24")
  expect(result.map((event) => event.date)).toEqual(["2026-09-24"])
  expect(
    filterActivity(
      events,
      [],
      people,
      { ...filters, q: "not present" },
      "2026-09-24",
    ),
  ).toEqual([])
  expect(
    filterActivity(
      events,
      [],
      [],
      { q: "unavailable project", member: "", kind: "", period: 0 },
      "2026-09-24",
    ),
  ).toHaveLength(events.length)
  expect(initialActivity[0].id).toBe("a01")
})

it("returns from a project to filtered Activity without reopening the event dialog", () => {
  const url =
    "/app/demo/activity?member=ava&kind=tasks&period=7&page=2&event=a22"

  const returnTo = projectReturnTo(url)
  expect(returnTo).not.toContain("event=")
  expect(projectReturnDestination(returnTo)).toEqual({
    to: "/app/demo/activity",
    hash: "",
    search: {
      q: "",
      member: "ava",
      kind: "tasks",
      period: 7,
      page: 2,
      event: "",
    },
  })
  expect(
    parseActivitySearch({ page: -1, period: 123, kind: "unknown", q: {} }),
  ).toEqual({ q: "", member: "", kind: "", period: 0, page: 1, event: "" })
})
