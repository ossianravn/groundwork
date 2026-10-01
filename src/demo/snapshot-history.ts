import type { Activity, Project, ProjectTask } from "./model"
import { dateOffset, windowDates } from "./report-period"

/**
 * When each project started (its first task) and, if completed, when it
 * finished (the "finished" Activity event, else its last completion).
 */
function lifespans(
  projects: Project[],
  tasks: ProjectTask[],
  activity: Activity[],
) {
  return projects.map((project) => {
    const own = tasks.filter((task) => task.projectId === project.id)
    const events = activity.filter((event) => event.projectId === project.id)

    const start = own.reduce(
      (first, task) => (task.createdAt < first ? task.createdAt : first),
      "9999-12-31",
    )

    const finished =
      events.find((event) => event.action === "finished")?.date ??
      events.reduce(
        (last, event) => (event.date > last ? event.date : last),
        "",
      )

    return {
      project,
      start,
      end: project.status === "completed" ? finished : undefined,
    }
  })
}

/**
 * The Overview snapshot figures as they stood on each of the last `days`
 * days up to the reference date, oldest first, for sparklines. Today's
 * values equal projectSummary's.
 */
export function snapshotHistory(
  projects: Project[],
  tasks: ProjectTask[],
  activity: Activity[],
  reference: string,
  days = 30,
) {
  const spans = lifespans(projects, tasks, activity)

  return windowDates({
    start: dateOffset(reference, 1 - days),
    end: reference,
  }).map((date) => {
    const active = spans.filter(
      (span) => span.start <= date && (!span.end || span.end > date),
    )

    const ids = new Set(active.map((span) => span.project.id))

    return {
      date,
      active: active.length,
      remaining: tasks.filter(
        (task) =>
          ids.has(task.projectId) &&
          task.createdAt <= date &&
          (!task.completedAt || task.completedAt > date),
      ).length,
      due: active.filter(
        (span) =>
          span.project.dueDate >= date &&
          span.project.dueDate <= dateOffset(date, 7),
      ).length,
      completed: spans.filter((span) => span.end && span.end <= date).length,
    }
  })
}
