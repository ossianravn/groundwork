import type { Activity, Project, ProjectTask } from "./model"
import { dateOffset, windowDates, type ReportWindow } from "./report-period"

export { dateOffset }

export function completionSeries(activity: Activity[], window: ReportWindow) {
  return windowDates(window).map((date) => ({
    date,
    completed: activity
      .filter((event) => event.date === date)
      .reduce((sum, event) => sum + event.tasksCompleted, 0),
  }))
}

/**
 * Tasks completed and added each day. Completions come from Activity, as
 * everywhere else; additions from each task's creation date.
 */
export function taskSeries(
  activity: Activity[],
  tasks: ProjectTask[],
  window: ReportWindow,
) {
  const added = new Map<string, number>()

  for (const task of tasks)
    added.set(task.createdAt, (added.get(task.createdAt) ?? 0) + 1)

  return completionSeries(activity, window).map((day) => ({
    ...day,
    added: added.get(day.date) ?? 0,
  }))
}

export function projectSummary(projects: Project[], reference: string) {
  const active = projects.filter((project) => project.status !== "completed")

  return {
    active: active.length,
    remaining: active.reduce(
      (sum, project) => sum + project.tasks - project.completedTasks,
      0,
    ),
    due: active.filter(
      (project) =>
        project.dueDate >= reference &&
        project.dueDate <= dateOffset(reference, 7),
    ).length,
    completed: projects.length - active.length,
  }
}
