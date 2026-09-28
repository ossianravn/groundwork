import { textDocument } from "@/kit/rich-text/document"
import { expect, it } from "vitest"
import { completionBreakdown } from "./analytics"
import { completionSeries } from "./selectors"
import type { Activity, Project } from "./model"

const projects: Project[] = [
  {
    id: "p",
    name: "Project",
    code: "P",
    color: "violet",
    description: textDocument(""),
    tags: [],
    links: [],
    ownerId: "new-owner",
    dueDate: "2026-09-30",
    status: "in-progress",
    tasks: 20,
    completedTasks: 9,
  },
]

const people = [
  { id: "a", name: "Ava", initials: "A" },
  { id: "b", name: "Leo", initials: "L" },
]

function event(
  date: string,
  projectId: string,
  memberId: string,
  tasksCompleted: number,
): Activity {
  return {
    id: `${date}-${projectId}-${memberId}`,
    date,
    projectId,
    memberId,
    tasksCompleted,
    kind: "tasks",
    action: "updated",
  }
}

it("keeps all three views in the same date/project scope and attributes work to its actor", () => {
  const activity = [
    event("2026-09-17", "p", "a", 90),
    event("2026-09-18", "p", "a", 2),
    event("2026-09-24", "p", "b", 7),
    event("2026-09-24", "other", "a", 5),
    event("2026-09-25", "p", "a", 90),
  ]

  const result = completionBreakdown(
    activity,
    projects,
    people,
    "2026-09-24",
    7,
    "p",
  )

  expect(result.projects).toEqual([{ id: "p", name: "Project", completed: 9 }])
  expect(result.contributors).toEqual([
    { id: "b", name: "Leo", completed: 7 },
    { id: "a", name: "Ava", completed: 2 },
  ])
  expect(
    completionSeries(result.activity, "2026-09-24", 7).reduce(
      (sum, day) => sum + day.completed,
      0,
    ),
  ).toBe(9)
})

it("does not turn non-completion activity or an empty scope into chart categories", () => {
  const result = completionBreakdown(
    [event("2026-09-24", "p", "a", 0)],
    projects,
    people,
    "2026-09-24",
    7,
    "",
  )

  expect(result.projects).toEqual([])
  expect(result.contributors).toEqual([])
  expect(
    completionBreakdown([], projects, people, "2026-09-24", 30, "").activity,
  ).toEqual([])
})
