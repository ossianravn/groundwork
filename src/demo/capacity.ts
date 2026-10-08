import type { Project, ProjectTask } from "./model"
import { dateOffset } from "./report-period"

// A simple capacity model for planning a project's remaining work: each
// person works through their projects in due-date order, at the pace they
// kept over the last four weeks. It is an estimate, and the answers that
// use it say so.

/** One person as a plan sees them. */
export interface PlanPerson {
  id: string
  name: string
  /** Tasks completed a day over the last four weeks, on any project. */
  pace: number
  /** Open tasks they reach first: those on projects due earlier. */
  before: number
}

/** One of the project's open tasks. */
export interface PlanTask {
  id: string
  title: string
  assigneeId: string | null
}

/** Moving a task to someone else, or deferring it past the due date. */
export const deferred = "defer"

/** The plan's edits, by task: the person it goes to, or `deferred`. */
export type PlanMoves = { [taskId: string]: string }

export interface PersonLoad {
  personId: string
  /** Their open tasks in this project once the plan applies. */
  tasks: number
  /** When they clear them, or null without a recent pace to go by. */
  finish: string | null
}

export interface PlanOutcome {
  load: PersonLoad[]
  /** Open tasks nobody holds; they are not in the finish date. */
  unowned: number
  deferred: number
  /** Tasks still in scope: open ones that are not deferred. */
  remaining: number
  /** The latest of everyone's finish; the reference date when nothing is left. */
  finish: string | null
}

const paceDays = 28

/** Each person's completions a day over the last four weeks. */
export function paceByPerson(tasks: ProjectTask[], reference: string) {
  const start = dateOffset(reference, -(paceDays - 1))
  const done = new Map<string, number>()

  for (const task of tasks)
    if (
      task.assigneeId &&
      task.completedAt &&
      task.completedAt >= start &&
      task.completedAt <= reference
    )
      done.set(task.assigneeId, (done.get(task.assigneeId) ?? 0) + 1)

  // Divided once: summing 1/28 drifts, and 14 days of work became 15.
  return new Map([...done].map(([id, count]) => [id, count / paceDays]))
}

/** The people who could take part in a project's plan, with what they owe first. */
export function planPeople(
  project: Project,
  projects: Project[],
  tasks: ProjectTask[],
  people: { id: string; name: string }[],
  reference: string,
): PlanPerson[] {
  const pace = paceByPerson(tasks, reference)

  const earlier = new Set(
    projects.flatMap((item) =>
      item.id !== project.id &&
      item.status !== "completed" &&
      item.dueDate <= project.dueDate
        ? [item.id]
        : [],
    ),
  )

  return people.map((person) => ({
    id: person.id,
    name: person.name,
    pace: pace.get(person.id) ?? 0,
    before: tasks.filter(
      (task) =>
        !task.done &&
        task.assigneeId === person.id &&
        earlier.has(task.projectId),
    ).length,
  }))
}

/** When a person clears what they owe first plus `count` tasks here. */
export function personFinish(
  person: PlanPerson,
  count: number,
  reference: string,
) {
  if (!count) return reference

  if (person.pace <= 0) return null

  // A whole number of days stays whole despite floating-point noise.
  const days = (person.before + count) / person.pace

  return dateOffset(reference, Math.ceil(days - 1e-9))
}

/** Who holds each task once the moves apply; null when nobody does. */
export function holderOf(task: PlanTask, moves: PlanMoves) {
  return moves[task.id] ?? task.assigneeId
}

/** What the plan comes to: each person's load and finish, and the project's. */
export function planOutcome(
  people: PlanPerson[],
  tasks: PlanTask[],
  moves: PlanMoves,
  reference: string,
): PlanOutcome {
  const holders = tasks.map((task) => holderOf(task, moves))
  const count = (id: string | null) => holders.filter((h) => h === id).length

  const load = people.flatMap((person) => {
    const tasks = count(person.id)

    return tasks
      ? [
          {
            personId: person.id,
            tasks,
            finish: personFinish(person, tasks, reference),
          },
        ]
      : []
  })

  return {
    load,
    unowned: count(null),
    deferred: count(deferred),
    remaining: holders.filter((h) => h !== deferred).length,
    finish: latest(
      load.map((item) => item.finish),
      reference,
    ),
  }
}

/** The last of some finishes: null if any is unknown, the reference if none. */
function latest(finishes: (string | null)[], reference: string) {
  return finishes.includes(null)
    ? null
    : finishes.reduce<string>(
        (last, date) => (date && date > last ? date : last),
        reference,
      )
}

/** One person in a team plan: their pace, with no project of their own. */
export type TeamPerson = Pick<PlanPerson, "id" | "name" | "pace">

/** An open project in a team plan. */
export interface PlanProject {
  id: string
  name: string
  dueDate: string
}

/** An open task in a team plan, on one of its projects. */
export interface TeamTask extends PlanTask {
  projectId: string
}

/** A person's open work across projects once a team plan applies. */
export interface TeamLoad {
  personId: string
  tasks: number
  /** When they clear all of it, or null without a recent pace. */
  finish: string | null
  /** Their part of each project, in the order they work: by due date. */
  projects: { projectId: string; tasks: number; finish: string | null }[]
}

export interface TeamOutcome {
  load: TeamLoad[]
  /** When each project lands: once everyone clears their part of it. */
  projects: { projectId: string; finish: string | null }[]
}

/**
 * What a team plan comes to: each person's work across the projects, taken
 * in due-date order, and when each project lands.
 */
export function teamOutcome(
  people: TeamPerson[],
  projects: PlanProject[],
  tasks: TeamTask[],
  moves: PlanMoves,
  reference: string,
): TeamOutcome {
  const order = [...projects].sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const due = new Map(order.map((project) => [project.id, project.dueDate]))

  const load = people.flatMap((person) => {
    const theirs = tasks.filter(
      (task) => due.has(task.projectId) && holderOf(task, moves) === person.id,
    )

    const parts = order.flatMap((project) => {
      const count = theirs.filter((t) => t.projectId === project.id).length

      // What they reach first: their work on projects due no later.
      const before = theirs.filter(
        (task) =>
          task.projectId !== project.id &&
          (due.get(task.projectId) ?? "") <= project.dueDate,
      ).length

      const finish = personFinish({ ...person, before }, count, reference)

      return count ? [{ projectId: project.id, tasks: count, finish }] : []
    })

    const finish = latest(
      parts.map((part) => part.finish),
      reference,
    )

    return parts.length
      ? [{ personId: person.id, tasks: theirs.length, finish, projects: parts }]
      : []
  })

  return {
    load,
    projects: order.map((project) => ({
      projectId: project.id,
      finish: latest(
        load.flatMap((item) =>
          item.projects.flatMap((part) =>
            part.projectId === project.id ? [part.finish] : [],
          ),
        ),
        reference,
      ),
    })),
  }
}
