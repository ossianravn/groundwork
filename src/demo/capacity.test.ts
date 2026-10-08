import { expect, it } from "vitest"
import { movesOf, proposeChanges } from "./assistant/land-plan"
import {
  deferred,
  paceByPerson,
  planOutcome,
  planPeople,
  type PlanTask,
} from "./capacity"
import { initialProjects } from "./project-fixtures"
import { initialTasks } from "./project-tasks"
import workspace from "./data/workspace.json"

const reference = workspace.referenceDate

const website = initialProjects.find((project) => project.id === "website")

if (!website) throw new Error("No Website redesign fixture")

const people = planPeople(
  website,
  initialProjects,
  initialTasks,
  workspace.members,
  reference,
)

const tasks: PlanTask[] = initialTasks
  .filter((task) => task.projectId === "website" && !task.done)
  .map(({ id, title, assigneeId }) => ({ id, title, assigneeId }))

it("measures each person's pace over the last four weeks", () => {
  const pace = paceByPerson(initialTasks, reference)

  expect(pace.get("ava")).toBeCloseTo(30 / 28)
  expect(pace.get("noah")).toBeCloseTo(12 / 28)
})

it("counts what each person reaches first: projects due earlier", () => {
  expect(
    Object.fromEntries(people.map((person) => [person.id, person.before])),
  ).toEqual({ ava: 4, leo: 0, mia: 4, noah: 1 })
})

it("finishes when the slowest person does, leaving unowned work out", () => {
  const outcome = planOutcome(people, tasks, {}, reference)

  expect(outcome.finish).toBe("2026-10-13")
  expect(outcome.unowned).toBe(6)
  expect(outcome.load).toEqual([
    { personId: "leo", tasks: 14, finish: "2026-10-10" },
    { personId: "noah", tasks: 7, finish: "2026-10-13" },
  ])

  const noahs = tasks.filter((task) => task.assigneeId === "noah")

  const lighter = planOutcome(
    people,
    tasks,
    Object.fromEntries(noahs.map((task) => [task.id, deferred])),
    reference,
  )

  expect(lighter.finish).toBe("2026-10-10")
  expect(lighter.deferred).toBe(7)
  expect(lighter.remaining).toBe(20)
})

it("proposes a few grouped changes that land the project with slack", () => {
  const changes = proposeChanges(people, tasks, website.dueDate, reference, {
    priority: "date",
    helpers: ["ava", "mia"],
  })

  expect(changes.map((change) => change.title)).toEqual([
    "Give 6 unowned tasks to Ava (4) and Mia (2)",
    "Move 3 of Noah's tasks to Mia (2) and Ava (1)",
    "Move 3 of Leo's tasks to Ava (2) and Mia (1)",
  ])
  expect(planOutcome(people, tasks, movesOf(changes), reference).finish).toBe(
    "2026-10-06",
  )
})

it("defers work to hit the date only when the date comes first", () => {
  const options = { helpers: ["mia"] }

  const date = proposeChanges(people, tasks, website.dueDate, reference, {
    ...options,
    priority: "date",
  })

  const scope = proposeChanges(people, tasks, website.dueDate, reference, {
    ...options,
    priority: "scope",
  })

  const deferrals = (changes: typeof date) =>
    changes.filter(
      (change) =>
        change.proposed && change.moves.some((move) => move.to === deferred),
    )

  expect(deferrals(date).length).toBeGreaterThan(0)
  expect(
    planOutcome(people, tasks, movesOf(date), reference).finish,
  ).not.toBeNull()
  expect(
    (planOutcome(people, tasks, movesOf(date), reference).finish ?? "") <=
      website.dueDate,
  ).toBe(true)
  expect(deferrals(scope)).toEqual([])
})
