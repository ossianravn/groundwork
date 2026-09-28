import type { Activity, Member, Period, Project } from "./model"
import { dateOffset } from "./selectors"

export interface CompletionGroup {
  id: string
  name: string
  completed: number
}

export function completionBreakdown(
  activity: Activity[],
  projects: Project[],
  people: Member[],
  reference: string,
  period: Period,
  projectId: string,
) {
  const start = dateOffset(reference, 1 - period)

  const scoped = activity.filter(
    (event) =>
      event.date >= start &&
      event.date <= reference &&
      (!projectId || event.projectId === projectId),
  )

  function groupBy(
    key: "projectId" | "memberId",
    names: { id: string; name: string }[],
    missing: string,
  ) {
    const groups = new Map<string, CompletionGroup>()

    for (const event of scoped) {
      if (!event.tasksCompleted) continue
      const id = event[key]

      const group = groups.get(id) ?? {
        id,
        name: names.find((item) => item.id === id)?.name ?? missing,
        completed: 0,
      }

      group.completed += event.tasksCompleted
      groups.set(id, group)
    }

    return [...groups.values()].sort(
      (a, b) => b.completed - a.completed || a.name.localeCompare(b.name),
    )
  }

  return {
    activity: scoped,
    projects: groupBy("projectId", projects, "Project unavailable"),
    contributors: groupBy("memberId", people, "Former member"),
  }
}
