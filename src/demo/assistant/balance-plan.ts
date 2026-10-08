import {
  holderOf,
  teamOutcome,
  type PlanMoves,
  type PlanProject,
  type TeamOutcome,
  type TeamPerson,
  type TeamTask,
} from "../capacity"
import { daysBetween } from "./answer-format"
import { groupMoves, type PlanChange } from "./land-plan"

/** How far a part of someone's work runs past its project's due date. */
function overrun(finish: string | null, dueDate: string) {
  return finish === null
    ? Number.MAX_SAFE_INTEGER
    : Math.max(0, daysBetween(dueDate, finish))
}

/**
 * Moves that bring every project in by its due date, as far as the team
 * has room: whoever runs furthest past a project's due date gives their
 * last task there to the person who would finish it soonest while still
 * finishing all their own work in time. A late part nobody can take on is
 * left as it is. Tasks without an owner stay out of it.
 */
export function proposeMoves(
  people: TeamPerson[],
  projects: PlanProject[],
  tasks: TeamTask[],
  reference: string,
): PlanChange[] {
  const moves: PlanMoves = {}
  const stuck = new Set<string>()
  const due = new Map(projects.map((project) => [project.id, project.dueDate]))

  // Every part of someone's work lands by its project's due date.
  const onTime = (outcome: TeamOutcome, personId: string) =>
    (
      outcome.load.find((item) => item.personId === personId)?.projects ?? []
    ).every((part) => overrun(part.finish, due.get(part.projectId) ?? "") === 0)

  for (let step = 0; step < tasks.length; step += 1) {
    const outcome = teamOutcome(people, projects, tasks, moves, reference)

    const late = outcome.load
      .flatMap((item) =>
        item.projects.map((part) => ({
          key: `${item.personId}:${part.projectId}`,
          personId: item.personId,
          projectId: part.projectId,
          by: overrun(part.finish, due.get(part.projectId) ?? ""),
        })),
      )
      .filter((part) => part.by > 0 && !stuck.has(part.key))
      .sort((a, b) => b.by - a.by)[0]

    if (!late) break

    const task = tasks
      .filter(
        (item) =>
          item.projectId === late.projectId &&
          holderOf(item, moves) === late.personId,
      )
      .at(-1)

    const best = task
      ? people
          .filter((helper) => helper.id !== late.personId && helper.pace > 0)
          .flatMap((helper) => {
            const trial = { ...moves, [task.id]: helper.id }
            const after = teamOutcome(people, projects, tasks, trial, reference)

            const finish = after.load
              .find((item) => item.personId === helper.id)
              ?.projects.find(
                (part) => part.projectId === late.projectId,
              )?.finish

            return finish && onTime(after, helper.id)
              ? [{ helper, finish }]
              : []
          })
          .sort((a, b) => a.finish.localeCompare(b.finish))[0]
      : undefined

    if (!task || !best) {
      stuck.add(late.key)
      continue
    }

    if (best.helper.id === task.assigneeId) delete moves[task.id]
    else moves[task.id] = best.helper.id
  }

  // One change per person and project, in the order the projects are due.
  return [...projects]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .flatMap((project) =>
      groupMoves(
        people,
        tasks.filter((task) => task.projectId === project.id),
        moves,
        true,
        `${project.name} task`,
      )
        .sort((a, b) => b.moves.length - a.moves.length)
        .map((change) => ({ ...change, id: `${project.id}-${change.id}` })),
    )
}
