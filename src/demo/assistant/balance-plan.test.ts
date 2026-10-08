import { expect, it } from "vitest"
import { teamOutcome } from "../capacity"
import { balanceAnswer, teamInputs } from "./balance-answer"
import { proposeMoves } from "./balance-plan"
import { movesOf } from "./land-plan"
import { teamPlanProps } from "./plan-schemas"
import { context } from "./transport-test-support"

const reference = context.referenceDate

const { people, plan, tasks } = teamInputs(context)

const due = new Map(plan.map((project) => [project.id, project.dueDate]))

it("takes each person's projects in due-date order, at their pace", () => {
  const outcome = teamOutcome(people, plan, tasks, {}, reference)

  expect(outcome.projects).toEqual([
    { projectId: "brand", finish: "2026-09-28" },
    { projectId: "mobile", finish: "2026-09-29" },
    { projectId: "website", finish: "2026-10-13" },
    { projectId: "design-system", finish: "2026-11-26" },
  ])

  // 27 tasks at 12 completions in 28 days take exactly 63 days.
  expect(outcome.load.find((item) => item.personId === "noah")).toEqual({
    personId: "noah",
    tasks: 27,
    finish: "2026-11-26",
    projects: [
      { projectId: "mobile", tasks: 1, finish: "2026-09-27" },
      { projectId: "website", tasks: 7, finish: "2026-10-13" },
      { projectId: "design-system", tasks: 19, finish: "2026-11-26" },
    ],
  })
})

it("moves overloaded people's work to people with room, landing every project", () => {
  const changes = proposeMoves(people, plan, tasks, reference)

  expect(changes.map((change) => change.title)).toEqual([
    "Move 2 of Noah's Website redesign tasks to Ava",
    "Move 1 of Leo's Website redesign tasks to Mia",
    "Move 16 of Noah's Design system tasks to Ava (9) and Mia (7)",
    "Move 3 of Leo's Design system tasks to Mia (2) and Ava (1)",
  ])

  const outcome = teamOutcome(people, plan, tasks, movesOf(changes), reference)

  // Nobody, helper or not, ends any part of a project after its due date.
  const late = outcome.load.flatMap((item) =>
    item.projects.flatMap((part) =>
      !part.finish || part.finish > (due.get(part.projectId) ?? "")
        ? [`${item.personId} on ${part.projectId}`]
        : [],
    ),
  )

  expect(late).toEqual([])
})

it("finds nobody overloaded once the moves are applied", () => {
  const moves = movesOf(proposeMoves(people, plan, tasks, reference))

  const after = balanceAnswer({
    ...context,
    tasks: context.tasks.map((task) => {
      const to = moves[task.id]

      return to ? { ...task, assigneeId: to } : task
    }),
  })

  const nodes = after.answer?.nodes ?? []

  expect(nodes[0]?.props).toMatchObject({ text: "Nobody is overloaded" })
  expect(teamPlanProps.parse(nodes[2]?.props).changes).toEqual([])
})

it("leaves late work where it is when nobody has room", () => {
  const noah = people.filter((person) => person.id === "noah")
  const theirs = tasks.filter((task) => task.assigneeId === "noah")

  expect(proposeMoves(noah, plan, theirs, reference)).toEqual([])
})
