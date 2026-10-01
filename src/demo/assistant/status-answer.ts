import script from "../data/assistant.json"
import { actionWithinProject } from "../activity"
import { formatDate, statusLabels, type Project } from "../model"
import { dateOffset } from "../report-period"
import {
  askForProject,
  daysBetween,
  personName,
  plural,
  projectPath,
} from "./answer-format"
import type { AssistantContext, AssistantReply } from "./assistant-types"
import { atRiskProjects } from "./risk-answer"

type Answer = Omit<AssistantReply, "followUps">

function dueLine(project: Project, reference: string) {
  const days = daysBetween(reference, project.dueDate)

  const when =
    days < 0
      ? `${plural(-days, "day")} overdue`
      : days === 0
        ? "today"
        : `in ${plural(days, "day")}`

  return `due ${formatDate(project.dueDate)} (${when})`
}

/** The update itself, in markdown, from the project's week and task list. */
function statusDocument(project: Project, context: AssistantContext) {
  const start = dateOffset(context.referenceDate, -6)
  const done = project.completedTasks
  const share = project.tasks ? Math.round((done / project.tasks) * 100) : 0

  const events = context.activity.filter(
    (event) =>
      event.projectId === project.id &&
      event.date >= start &&
      event.date <= context.referenceDate,
  )

  const next = context.tasks
    .filter((task) => task.projectId === project.id && !task.done)
    .slice(0, 3)

  const risk = atRiskProjects(context).find(
    (entry) => entry.project.id === project.id,
  )

  const watch = risk
    ? `At risk: ${plural(risk.open, "task")} still open with the due date close.`
    : `On track for ${formatDate(project.dueDate)}.`

  return [
    `## ${project.name}: week of ${formatDate(start)} – ${formatDate(context.referenceDate)}`,
    `**${statusLabels[project.status]}**, ${dueLine(project, context.referenceDate)}. ${done} of ${plural(project.tasks, "task")} done (${share}%).`,
    "### This week",
    events.length
      ? events
          .map(
            (event) =>
              `- ${personName(context, event.memberId)} ${actionWithinProject(event.action)}${event.tasksCompleted ? ` (${plural(event.tasksCompleted, "task")})` : ""}`,
          )
          .join("\n")
      : "- No recorded activity this week.",
    "### Next",
    next.length
      ? next.map((task) => `- ${task.title}`).join("\n")
      : "- No open tasks.",
    "### Watch",
    watch,
  ].join("\n\n")
}

/** A draft update for a project, as an artifact to copy, download or post. */
export function statusDraft(
  project: Project,
  context: AssistantContext,
): Answer {
  return {
    todo: {
      title: `Draft a status update for ${project.name}`,
      tasks: [
        { label: "Read the project's week", after: "text" },
        { label: "Write the update", after: "artifact" },
      ],
    },
    text: script.status.intro.replace("{project}", project.name),
    artifact: {
      title: `Status update: ${project.name}`,
      projectId: project.id,
      projectName: project.name,
      url: projectPath(project),
      content: statusDocument(project, context),
      complete: true,
    },
  }
}

/** A request for an update: draft it, or ask which project first. */
export function statusAnswer(
  prompt: string,
  context: AssistantContext,
): Answer {
  const text = prompt.toLowerCase()

  const project = context.projects.find((item) =>
    text.includes(item.name.toLowerCase()),
  )

  return project
    ? statusDraft(project, context)
    : askForProject(
        context,
        "status",
        "Which project should the update cover? I'll draft it from that project's week.",
      )
}
