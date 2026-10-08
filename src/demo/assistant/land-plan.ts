import {
  deferred,
  holderOf,
  personFinish,
  planOutcome,
  type PlanMoves,
  type PlanPerson,
  type PlanTask,
} from "../capacity"
import { dateOffset } from "../report-period"

/** A step of the proposal: some tasks move to someone, or are deferred. */
export interface PlanChange {
  id: string
  title: string
  /** Who the tasks come from; null when nobody holds them. */
  from: string | null
  moves: { taskId: string; to: string }[]
  /** In the proposal from the start; otherwise offered as an option. */
  proposed: boolean
}

export interface PlanOptions {
  /** Hit the due date, deferring work if need be, or keep every task. */
  priority: "date" | "scope"
  /** Who can take on tasks from others. */
  helpers: string[]
}

/** Days of slack the proposal aims for before the due date. */
const buffer = 2

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`

const firstName = (person: Pick<PlanPerson, "name"> | undefined) =>
  person?.name.split(" ")[0] ?? "someone"

/**
 * Names a change: whose tasks, how many, and where they go. `noun` names
 * the tasks, such as "Design system task" when the plan spans projects.
 */
function changeTitle(
  people: Pick<PlanPerson, "id" | "name">[],
  change: PlanChange,
  noun: string,
) {
  const from = people.find((person) => person.id === change.from)
  const count = change.moves.length

  const tasks = from
    ? `${count} of ${firstName(from)}'s ${noun}s`
    : plural(count, `unowned ${noun}`)

  if (change.moves.every((move) => move.to === deferred))
    return `Defer ${tasks}`

  const shares = new Map<string, number>()

  for (const move of change.moves)
    shares.set(move.to, (shares.get(move.to) ?? 0) + 1)

  const targets = [...shares].map(([id, share]) => {
    const name = firstName(people.find((person) => person.id === id))

    return shares.size > 1 ? `${name} (${share})` : name
  })

  return `${from ? "Move" : "Give"} ${tasks} to ${targets.join(" and ")}`
}

/** Groups the moves by whose tasks they are, and whether they move or wait. */
export function groupMoves(
  people: Pick<PlanPerson, "id" | "name">[],
  tasks: PlanTask[],
  moves: PlanMoves,
  proposed: boolean,
  noun = "task",
): PlanChange[] {
  const groups = new Map<string, PlanChange>()

  for (const task of tasks) {
    const to = moves[task.id]

    if (!to) continue

    const kind = to === deferred ? "defer" : "move"
    const id = `${task.assigneeId ?? "unowned"}-${kind}`

    const group = groups.get(id) ?? {
      id,
      title: "",
      from: task.assigneeId,
      moves: [],
      proposed,
    }

    group.moves.push({ taskId: task.id, to })
    groups.set(id, group)
  }

  // Unowned work first, then moves, then what waits.
  const rank = (group: PlanChange) =>
    (group.moves.some((move) => move.to === deferred) ? 2 : 0) +
    (group.from ? 1 : 0)

  return [...groups.values()]
    .sort((a, b) => rank(a) - rank(b))
    .map((group) => ({ ...group, title: changeTitle(people, group, noun) }))
}

/**
 * The changes that would land the project: unowned tasks go to whoever
 * would finish them soonest; then the latest person's last tasks move to a
 * helper who still finishes in time, aiming for two days of slack; then,
 * if the date matters more than the scope, the latest tasks are deferred.
 * Also offers deferring the newest tasks for more slack when that helps.
 */
export function proposeChanges(
  people: PlanPerson[],
  tasks: PlanTask[],
  dueDate: string,
  reference: string,
  options: PlanOptions,
): PlanChange[] {
  const moves: PlanMoves = {}

  const target = [dateOffset(dueDate, -buffer), reference].sort()[1] ?? dueDate

  const helpers = options.helpers.flatMap((id) => {
    const person = people.find((item) => item.id === id)

    return person && person.pace > 0 ? [person] : []
  })

  const held = (id: string) =>
    tasks.filter((task) => holderOf(task, moves) === id).length

  // The helper who would finish soonest with one more task.
  const soonest = (excluding: string | null) =>
    helpers
      .filter((helper) => helper.id !== excluding)
      .map((helper) => ({
        helper,
        finish: personFinish(helper, held(helper.id) + 1, reference),
      }))
      .sort((a, b) => (a.finish ?? "~").localeCompare(b.finish ?? "~"))[0]

  for (const task of tasks.filter((item) => !item.assigneeId)) {
    const best = soonest(null)

    if (best) moves[task.id] = best.helper.id
  }

  const latest = () =>
    planOutcome(people, tasks, moves, reference)
      .load.filter((item) => item.finish === null || item.finish > target)
      .sort((a, b) => (b.finish ?? "~").localeCompare(a.finish ?? "~"))[0]

  for (let step = 0; step < tasks.length; step += 1) {
    const late = latest()

    const theirs =
      late && tasks.filter((t) => holderOf(t, moves) === late.personId)

    const task = theirs?.at(-1)
    const best = late && soonest(late.personId)

    if (!task || !best?.finish || best.finish > target) break

    moves[task.id] = best.helper.id
  }

  if (options.priority === "date")
    for (let step = 0; step < tasks.length; step += 1) {
      const finish = planOutcome(people, tasks, moves, reference).finish
      const late = finish === null || finish > dueDate ? latest() : undefined

      const task =
        late && tasks.filter((t) => holderOf(t, moves) === late.personId).at(-1)

      if (!task) break

      moves[task.id] = deferred
    }

  const changes = groupMoves(people, tasks, moves, true)

  // An option, not a proposal: defer the two newest tasks for more slack.
  const now = planOutcome(people, tasks, moves, reference)
  const lastLoad = now.load.find((item) => item.finish === now.finish)

  const newest = tasks
    .filter((task) => holderOf(task, moves) === lastLoad?.personId)
    .slice(-2)

  const extra: PlanMoves = { ...moves }

  for (const task of newest) extra[task.id] = deferred

  const sooner = planOutcome(people, tasks, extra, reference).finish

  const option =
    newest.length && sooner && now.finish && sooner < now.finish
      ? groupMoves(
          people,
          newest,
          Object.fromEntries(newest.map((task) => [task.id, deferred])),
          false,
        ).map((change) => ({
          ...change,
          id: `option-${change.id}`,
          title: `Also ${change.title.charAt(0).toLowerCase()}${change.title.slice(1)}, for more slack`,
        }))
      : []

  return [...changes, ...option]
}

/** The moves a set of changes makes, as a starting plan. */
export function movesOf(changes: PlanChange[]): PlanMoves {
  return Object.fromEntries(
    changes.flatMap((change) =>
      change.proposed ? change.moves.map((move) => [move.taskId, move.to]) : [],
    ),
  )
}
