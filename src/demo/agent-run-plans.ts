import script from "./data/assistant.json"
import type { AgentRun, AgentRunStep, AgentWorkflow } from "./agent-runs"
import { formatDate, type Project, type ProjectComment } from "./model"
import { dateOffset } from "./report-period"
import { personName, plural } from "./assistant/answer-format"
import type { AssistantContext } from "./assistant/assistant-types"
import { statusDraft } from "./assistant/status-answer"

export interface RunContext extends AssistantContext {
  comments: ProjectComment[]
  currentUserId: string
}

export const workflowTitles: Record<AgentWorkflow, string> = {
  "status-report": "Status report",
  "launch-plan": "Launch plan",
}

type Step = Omit<AgentRunStep, "id" | "status" | "duration">

function statusReport(project: Project, context: RunContext) {
  const start = dateOffset(context.referenceDate, -6)

  const week = context.activity.filter(
    (event) =>
      event.projectId === project.id &&
      event.date >= start &&
      event.date <= context.referenceDate,
  )

  const finished = week.reduce((sum, event) => sum + event.tasksCompleted, 0)

  const comments = context.comments.filter(
    (comment) => comment.projectId === project.id,
  ).length

  const steps: Step[] = [
    {
      label: "Read the tasks",
      detail: `${project.tasks - project.completedTasks} open, ${finished} done this week`,
    },
    {
      label: "Read the week's activity",
      detail: plural(week.length, "change"),
    },
    {
      label: "Read the comments",
      detail: plural(comments, "comment"),
      error: "The comments didn't load in time.",
      skipLabel: "Continue without comments",
    },
    { label: "Write the report", detail: "Draft ready" },
    { label: "Review the report", detail: "Approved", gate: true },
    { label: "Post the report", detail: "Posted to Comments", applies: true },
  ]

  return {
    steps,
    report: statusDraft(project, context).artifact?.content,
  }
}

function launchPlan(project: Project, context: RunContext) {
  const owner = personName(context, project.ownerId)

  const existing = new Set(
    context.tasks
      .filter((task) => task.projectId === project.id)
      .map((task) => task.title.toLowerCase()),
  )

  const tasks = script.checklist.tasks
    .filter((task) => !existing.has(task.title.toLowerCase()))
    .map((task) => ({
      title: task.title,
      assigneeId: task.owner ? project.ownerId : null,
      assignee: task.owner ? owner : null,
    }))

  const open = context.tasks.filter(
    (task) => task.projectId === project.id && !task.done,
  ).length

  const steps: Step[] = [
    {
      label: "Read the brief",
      detail: `Due ${formatDate(project.dueDate)}, owned by ${owner}`,
    },
    {
      label: "Review the open tasks",
      detail: plural(open, "open task"),
      error: "The task list didn't load in time.",
      skipLabel: "Continue without the task list",
    },
    {
      label: "Find what's missing",
      detail: tasks.length
        ? `${plural(tasks.length, "launch step")} not covered`
        : "Every launch step is already a task",
    },
  ]

  if (tasks.length)
    steps.push(
      { label: "Draft the tasks", detail: plural(tasks.length, "task") },
      { label: "Approve the tasks", detail: "Approved", gate: true },
      {
        label: "Add the tasks",
        detail: `${plural(tasks.length, "task")} added to Tasks`,
        applies: true,
      },
    )

  return { steps, tasks }
}

/**
 * A new run of a workflow on a project, with its first step under way. It
 * reads the records now, so its findings describe the project as it was
 * when the run started. With fail set, the step that can fail fails once.
 */
export function startRun(
  workflow: AgentWorkflow,
  project: Project,
  context: RunContext,
  now: number,
  fail = false,
): AgentRun {
  const plan =
    workflow === "status-report"
      ? statusReport(project, context)
      : launchPlan(project, context)

  return {
    id: crypto.randomUUID(),
    projectId: project.id,
    workflow,
    title: workflowTitles[workflow],
    startedBy: context.currentUserId,
    startedAt: now,
    status: "running",
    ...plan,
    steps: plan.steps.map((step, index) => ({
      ...step,
      id: `step-${index}`,
      status: index === 0 ? "running" : "pending",
      startedAt: index === 0 ? now : undefined,
      // Reading feels quick; writing takes a little longer.
      duration: index < 3 ? 900 + index * 300 : 1600,
      fails: fail && Boolean(step.error),
    })),
  }
}
