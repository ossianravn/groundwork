import { textDocument } from "@/kit/rich-text/document"
import { describe, expect, it } from "vitest"
import { completionSeries, projectSummary } from "./selectors"
import { reportWindow } from "./report-period"
import type { Activity, Project } from "./model"

describe("overview data", () => {
  it("includes both date boundaries, fills missing days, and excludes outside events", () => {
    const activity: Activity[] = [
      {
        id: "1",
        projectId: "p",
        memberId: "u",
        date: "2026-09-17",
        action: "finished",
        kind: "tasks",
        tasksCompleted: 90,
      },
      {
        id: "2",
        projectId: "p",
        memberId: "u",
        date: "2026-09-18",
        action: "finished",
        kind: "tasks",
        tasksCompleted: 2,
      },
      {
        id: "3",
        projectId: "p",
        memberId: "u",
        date: "2026-09-24",
        action: "finished",
        kind: "tasks",
        tasksCompleted: 3,
      },
      {
        id: "4",
        projectId: "p",
        memberId: "u",
        date: "2026-09-24",
        action: "finished",
        kind: "tasks",
        tasksCompleted: 4,
      },
      {
        id: "5",
        projectId: "p",
        memberId: "u",
        date: "2026-09-25",
        action: "finished",
        kind: "tasks",
        tasksCompleted: 90,
      },
    ]

    const result = completionSeries(
      activity,
      reportWindow("2026-09-24", { kind: "preset", days: 7 }),
    )

    expect(result).toHaveLength(7)
    expect(result[0]).toEqual({ date: "2026-09-18", completed: 2 })
    expect(result[3].completed).toBe(0)
    expect(result[6]).toEqual({ date: "2026-09-24", completed: 7 })
    expect(result.reduce((sum, day) => sum + day.completed, 0)).toBe(9)
  })

  it("reconciles the snapshot after a project is completed", () => {
    const project: Project = {
      id: "p",
      code: "P",
      color: "violet",
      name: "Project",
      description: textDocument(""),
      tags: [],
      links: [],
      ownerId: "u",
      status: "in-review",
      dueDate: "2026-09-30",
      tasks: 10,
      completedTasks: 7,
    }

    expect(projectSummary([project], "2026-09-24")).toEqual({
      active: 1,
      remaining: 3,
      due: 1,
      completed: 0,
    })
    expect(
      projectSummary(
        [{ ...project, status: "completed", completedTasks: 10 }],
        "2026-09-24",
      ),
    ).toEqual({ active: 0, remaining: 0, due: 0, completed: 1 })
  })
})
