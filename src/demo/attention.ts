import { plural } from "./assistant/answer-format"
import { formatDate, type Project, type ProjectTask } from "./model"
import { burnUp } from "./workload"

export interface AttentionItem {
  project: Project
  /** Why it needs attention, most urgent first. */
  reasons: string[]
  /** Overdue, late at its pace, stalled, or only unassigned work. */
  rank: number
}

/**
 * Active projects that need someone: past their due date, finishing after
 * it at the last two weeks' pace, with no progress in that time, or with
 * open tasks nobody owns. Most urgent first; on-track projects are left out.
 */
export function needsAttention(
  projects: Project[],
  tasks: ProjectTask[],
  reference: string,
): AttentionItem[] {
  return projects
    .filter((project) => project.status !== "completed")
    .flatMap((project) => {
      const reasons: string[] = []
      let rank = 3

      if (project.dueDate < reference) {
        reasons.push(`Overdue since ${formatDate(project.dueDate)}`)
        rank = 0
      } else {
        const { finish } = burnUp(tasks, project, reference)

        if (finish === null) {
          reasons.push("No tasks done in the last two weeks")
          rank = 2
        } else if (finish && finish > project.dueDate) {
          reasons.push(
            `Finishes ${formatDate(finish)} at this pace, after its ${formatDate(project.dueDate)} due date`,
          )
          rank = 1
        }
      }

      const unowned = tasks.filter(
        (task) =>
          task.projectId === project.id && !task.done && !task.assigneeId,
      ).length

      if (unowned)
        reasons.push(`${plural(unowned, "open task")} without an owner`)

      return reasons.length ? [{ project, reasons, rank }] : []
    })
    .sort(
      (a, b) =>
        a.rank - b.rank || a.project.dueDate.localeCompare(b.project.dueDate),
    )
}
