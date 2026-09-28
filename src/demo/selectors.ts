import type { Activity, Period, Project } from "./model"

export function dateOffset(date: string, days: number) {
  const value = new Date(`${date}T00:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)

  return value.toISOString().slice(0, 10)
}

export function completionSeries(
  activity: Activity[],
  reference: string,
  period: Period,
) {
  return Array.from({ length: period }, (_, index) => {
    const date = dateOffset(reference, index - period + 1)

    return {
      date,
      completed: activity
        .filter((event) => event.date === date)
        .reduce((sum, event) => sum + event.tasksCompleted, 0),
    }
  })
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
