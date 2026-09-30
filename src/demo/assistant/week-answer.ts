import { formatDate } from "../model"
import { dateOffset } from "../report-period"
import { personName, plural, projectLink } from "./answer-format"
import type { AssistantContext, AssistantReply } from "./assistant-types"

/**
 * What changed this week: the assistant reports its progress as steps
 * (reading activity, grouping it, counting), then summarises by project.
 */
export function weekAnswer(
  context: AssistantContext,
): Omit<AssistantReply, "followUps"> {
  const start = dateOffset(context.referenceDate, -6)
  const range = `${formatDate(start)} – ${formatDate(context.referenceDate)}`

  const events = context.activity.filter(
    (event) => event.date >= start && event.date <= context.referenceDate,
  )

  const completed = events.reduce((sum, event) => sum + event.tasksCompleted, 0)

  const byProject = context.projects
    .map((project) => {
      const own = events.filter((event) => event.projectId === project.id)
      const tasks = own.reduce((sum, event) => sum + event.tasksCompleted, 0)

      const people = [...new Set(own.map((event) => event.memberId))].map(
        (id) => personName(context, id),
      )

      return { project, tasks, updates: own.length, people }
    })
    .filter((entry) => entry.updates)
    .sort((a, b) => b.tasks - a.tasks || b.updates - a.updates)

  const steps = [
    {
      id: "read",
      label: `Read the activity for ${range}`,
      results: [plural(events.length, "event")],
    },
    {
      id: "group",
      label: "Grouped the events by project",
      results: byProject.map((entry) => entry.project.name),
    },
    {
      id: "count",
      label: "Counted completed tasks",
      results: [plural(completed, "task")],
    },
  ]

  const sources = [
    {
      id: "activity",
      url: "/app/demo/activity",
      title: "Activity",
      description: `${plural(events.length, "event")}, ${range}`,
    },
  ]

  if (!events.length)
    return {
      steps,
      sources,
      text: `Nothing was recorded between ${range}. Activity appears here as the team completes tasks and updates projects.`,
    }

  const lines = byProject.map(
    ({ project, tasks, updates, people }) =>
      `- ${projectLink(project)}: ${tasks ? `${plural(tasks, "task")} completed` : plural(updates, "update")} by ${people.join(" and ")}`,
  )

  return {
    steps,
    sources,
    text: [
      `Between ${range} the team completed **${plural(completed, "task")}** across ${plural(byProject.length, "project")}.`,
      lines.join("\n"),
      "The [Activity](/app/demo/activity) page has every event, with filters by person and project.",
    ].join("\n\n"),
  }
}
