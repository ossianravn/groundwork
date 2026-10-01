import type { Activity, Member, Project, ProjectTask } from "./model"
import { weekStart } from "./project-timeline"
import { dateOffset, windowDates, type ReportWindow } from "./report-period"

/** A task is open on a day when it was added by then and not yet completed. */
const openOn = (task: ProjectTask, date: string) =>
  task.createdAt <= date && (!task.completedAt || task.completedAt > date)

export interface MemberLoad {
  id: string
  name: string
  total: number
  /** Open tasks per project id. */
  projects: Record<string, number>
}

/**
 * Open tasks per person now, split by project; unassigned work last. Only
 * open projects count, since completed ones take no work.
 */
export function openByMember(
  tasks: ProjectTask[],
  projects: Project[],
  members: Member[],
): MemberLoad[] {
  const active = new Set(
    projects.flatMap((p) => (p.status === "completed" ? [] : [p.id])),
  )

  const rows: MemberLoad[] = [
    ...members.map((member) => ({ id: member.id, name: member.name })),
    { id: "", name: "Unassigned" },
  ].map((row) => ({ ...row, total: 0, projects: {} }))

  for (const task of tasks) {
    if (task.done || !active.has(task.projectId)) continue

    const row = rows.find((item) => item.id === (task.assigneeId ?? ""))

    if (!row) continue

    row.total += 1
    row.projects[task.projectId] = (row.projects[task.projectId] ?? 0) + 1
  }

  const unassigned = rows.at(-1)

  const busy = rows
    .slice(0, -1)
    .filter((row) => row.total)
    .sort((a, b) => b.total - a.total)

  if (unassigned?.total) busy.push(unassigned)

  return busy
}

/** Open tasks per project id at a week's end, keyed for chart series. */
export type OpenPoint = { date: string } & Record<string, number | string>

/** A tag's completed tasks per member id, keyed for chart series. */
export type TagPoint = { tag: string } & Record<string, number | string>

/** Open tasks per project at the end of each week in the window. */
export function openByWeek(
  tasks: ProjectTask[],
  window: ReportWindow,
): OpenPoint[] {
  const ends = [
    ...new Set(
      windowDates(window).map((date) => {
        const end = dateOffset(weekStart(date), 6)

        return end > window.end ? window.end : end
      }),
    ),
  ]

  const projectIds = [...new Set(tasks.map((task) => task.projectId))]

  return ends.map((date) => ({
    date,
    ...Object.fromEntries(
      projectIds.map((id) => [
        id,
        tasks.filter((task) => task.projectId === id && openOn(task, date))
          .length,
      ]),
    ),
  }))
}

export interface BurnUpPoint {
  date: string
  /** Tasks in the project by then. */
  scope?: number
  /** Tasks completed by then. */
  done?: number
  /** Where completions are heading at the recent pace, after the snapshot. */
  projected?: number
}

/**
 * A project's burn-up: scope and completed work each day from its first
 * task to the snapshot, then a projection at the last two weeks' pace to
 * the due date (or a week past the snapshot, if that is later).
 */
export function burnUp(
  tasks: ProjectTask[],
  project: Project,
  reference: string,
) {
  const own = tasks.filter((task) => task.projectId === project.id)

  if (!own.length) return { points: [], finish: undefined }

  const start = own.reduce(
    (first, task) => (task.createdAt < first ? task.createdAt : first),
    reference,
  )

  const count = (date: string, done: boolean) =>
    own.filter((task) =>
      done
        ? task.completedAt && task.completedAt <= date
        : task.createdAt <= date,
    ).length

  const history: BurnUpPoint[] = windowDates({ start, end: reference }).map(
    (date) => ({ date, scope: count(date, false), done: count(date, true) }),
  )

  const last = history.at(-1)
  const doneNow = last?.done ?? 0
  const scopeNow = last?.scope ?? 0
  const pace = (doneNow - count(dateOffset(reference, -14), true)) / 14

  // Days until the remaining work is done at the recent pace.
  const finish =
    project.status === "completed" || doneNow >= scopeNow
      ? undefined
      : pace > 0
        ? dateOffset(reference, Math.ceil((scopeNow - doneNow) / pace))
        : null

  const horizon = [project.dueDate, dateOffset(reference, 7)].sort()[1]

  const future: BurnUpPoint[] =
    project.status === "completed"
      ? []
      : windowDates({ start: dateOffset(reference, 1), end: horizon }).map(
          (date, index) => ({
            date,
            projected: Math.min(
              scopeNow,
              Math.round(doneNow + pace * (index + 1)),
            ),
          }),
        )

  // The projection starts from today's figure, so the two lines join.
  if (last && future.length) last.projected = doneNow

  return { points: [...history, ...future], finish }
}

/** Tasks each member completed, by the tags of the projects they were in. */
export function workByTag(
  activity: Activity[],
  projects: Project[],
  memberIds: string[],
  window: ReportWindow,
): TagPoint[] {
  const tags = [...new Set(projects.flatMap((project) => project.tags))].sort()

  const completedIn = (id: string, tag: string) =>
    activity
      .filter(
        (event) =>
          event.memberId === id &&
          event.date >= window.start &&
          event.date <= window.end &&
          projects.find((p) => p.id === event.projectId)?.tags.includes(tag),
      )
      .reduce((sum, event) => sum + event.tasksCompleted, 0)

  return tags.map((tag) => ({
    tag,
    ...Object.fromEntries(memberIds.map((id) => [id, completedIn(id, tag)])),
  }))
}
