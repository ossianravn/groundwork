import { formatDate } from "../model"
import {
  citation,
  daysBetween,
  personName,
  plural,
  projectLink,
  projectPath,
  projectSummary,
} from "./answer-format"
import type {
  AssistantContext,
  AssistantReply,
  ProjectRow,
} from "./assistant-types"

const rule =
  "I count a project as at risk when it is overdue, due within a week with more than a quarter of its tasks open, or due within two weeks with more than half open."

/**
 * A project is at risk when it is overdue, due within a week with more than
 * a quarter of its tasks open, or due within two weeks with more than half
 * open. The reply states this rule so the judgement can be checked.
 */
export function atRiskProjects(context: AssistantContext) {
  return context.projects
    .filter((project) => project.status !== "completed")
    .map((project) => {
      const days = daysBetween(context.referenceDate, project.dueDate)
      const open = project.tasks - project.completedTasks
      const share = project.tasks ? open / project.tasks : 0

      return { project, days, open, share }
    })
    .filter(
      ({ days, share }) =>
        days < 0 || (days <= 7 && share > 0.25) || (days <= 14 && share > 0.5),
    )
    .sort((a, b) => a.days - b.days)
}

function dueIn(days: number) {
  if (days < 0) return `${plural(-days, "day")} overdue`

  return days === 0 ? "today" : `in ${plural(days, "day")}`
}

function answerText(context: AssistantContext) {
  const risks = atRiskProjects(context)
  const active = context.projects.filter((p) => p.status !== "completed")

  if (!risks.length)
    return `None of the ${plural(active.length, "active project")} looks at risk. ${rule}`

  const rows = risks.map(
    ({ project, days, open }) =>
      `| ${projectLink(project)} | ${personName(context, project.ownerId)} | ${formatDate(project.dueDate)} (${dueIn(days)}) | ${open} of ${project.tasks} |`,
  )

  const [first] = risks

  const others = active.filter(
    (project) => !risks.some((risk) => risk.project.id === project.id),
  )

  const urgency = `**${first.project.name}** is the most urgent: ${plural(first.open, "open task")} with ${first.days < 0 ? "its due date already passed" : `${plural(first.days, "day")} to go`}.${citation(1, [first.project.id])}`

  const rest = others.length
    ? ` The other ${plural(others.length, "active project")} ${others.length === 1 ? "is" : "are"} on track.${citation(
        risks.length + 1,
        others.map((project) => project.id),
      )}`
    : ""

  return [
    `${risks.length === 1 ? "One project needs" : `${plural(risks.length, "project")} need`} attention. ${rule}`,
    [
      "| Project | Owner | Due | Open tasks |",
      "| --- | --- | --- | --- |",
      ...rows,
    ].join("\n"),
    urgency + rest,
  ].join("\n\n")
}

/**
 * Which projects are at risk: the assistant reasons about the question,
 * searches the active projects with a tool, then answers with citations to
 * the projects it read. When the search fails, it says so instead.
 */
export function riskAnswer(
  context: AssistantContext,
  { toolFails }: { toolFails: boolean },
): Omit<AssistantReply, "followUps"> {
  const active = context.projects.filter((p) => p.status !== "completed")
  const risky = atRiskProjects(context).map((risk) => risk.project)

  const reasoning = `The question is about schedule risk, so I need each open project's due date and how much of its work is still open. I'll search the active projects, then compare each due date with today, ${formatDate(context.referenceDate)}, and the share of tasks still open.`

  const todo = {
    title: "Find the projects at risk",
    tasks: [
      { label: "Understand the question", after: "reasoning" as const },
      { label: "Search the open projects", after: "tool" as const },
      { label: "Compare due dates with open work", after: "text" as const },
    ],
  }

  const input = {
    status: ["in-progress", "in-review"],
    fields: ["dueDate", "owner", "tasks"],
  }

  if (toolFails)
    return {
      todo,
      reasoning,
      tool: {
        name: "searchProjects",
        input,
        errorText: "The projects service didn't respond within 10 seconds.",
      },
      text: "I couldn't read the projects just now, so I can't say which are at risk. Try again in a moment, or sort the [Projects](/app/demo/projects) list by due date.",
    }

  const output: ProjectRow[] = active.map((project) => ({
    id: project.id,
    name: project.name,
    owner: personName(context, project.ownerId),
    status: project.status,
    dueDate: project.dueDate,
    tasks: project.tasks,
    openTasks: project.tasks - project.completedTasks,
  }))

  const sources = [
    ...risky,
    ...active.filter((project) => !risky.includes(project)),
  ].map((project) => ({
    id: project.id,
    url: projectPath(project),
    title: project.name,
    description: projectSummary(project),
  }))

  return {
    todo,
    reasoning,
    tool: { name: "searchProjects", input, output },
    text: answerText(context),
    sources,
  }
}
