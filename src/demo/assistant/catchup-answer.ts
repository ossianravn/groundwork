import { trendLabel } from "@/kit/ui/sparkline-label"
import { actionWithinProject } from "../activity"
import { formatDate, statusLabels, type Project } from "../model"
import { formatBytes, isImageFile } from "../project-files"
import { dateOffset, windowDates } from "../report-period"
import { burnUp } from "../workload"
import {
  askForProject,
  citation,
  daysBetween,
  personName,
  plural,
  projectPath,
  projectSummary,
} from "./answer-format"
import { node } from "./answer-schemas"
import type { AssistantContext, AssistantReply } from "./assistant-types"

type Answer = Omit<AssistantReply, "followUps">

const activityPath = "/app/demo/activity"

function inDays(from: string, to: string) {
  const days = daysBetween(from, to)

  return days < 0
    ? `${plural(-days, "day")} overdue`
    : days === 0
      ? "today"
      : `in ${plural(days, "day")}`
}

/** Where the project stands: done, open, pace and when it would finish. */
function standing(project: Project, context: AssistantContext) {
  const reference = context.referenceDate
  const own = context.tasks.filter((task) => task.projectId === project.id)
  const open = own.filter((task) => !task.done)
  const weekStart = dateOffset(reference, -6)
  const { points, finish } = burnUp(context.tasks, project, reference)
  const history = points.filter((point) => point.date <= reference).slice(-30)

  const completedOn = (date: string) =>
    own.filter((task) => task.completedAt === date).length

  return {
    open,
    done: own.length - open.length,
    total: own.length,
    unassigned: open.filter((task) => !task.assigneeId),
    week: own.filter(
      (task) => task.completedAt && task.completedAt >= weekStart,
    ).length,
    finish,
    doneTrend: history.map((point) => point.done ?? 0),
    openTrend: history.map((point) => (point.scope ?? 0) - (point.done ?? 0)),
    daily: windowDates({
      start: dateOffset(reference, -13),
      end: reference,
    }).map(completedOn),
  }
}

function headline(project: Project, finish: string | null | undefined) {
  if (project.status === "completed") return `${project.name} is completed`

  if (finish === undefined) return `All of ${project.name}'s tasks are done`

  if (finish === null)
    return `${project.name} has had no completions in two weeks`

  return finish <= project.dueDate
    ? `${project.name} is on track for ${formatDate(project.dueDate)}`
    : `${project.name} is running ${plural(daysBetween(project.dueDate, finish), "day")} late`
}

function paceSentence(project: Project, finish: string | null | undefined) {
  if (project.status === "completed" || finish === undefined) return ""

  if (finish === null)
    return " Nothing was completed in the last two weeks, so there is no pace to project from."

  const gap = Math.abs(daysBetween(finish, project.dueDate))

  return finish <= project.dueDate
    ? ` At the last two weeks' pace they're done by ${formatDate(finish)}, ${plural(gap, "day")} before the due date.`
    : ` At the last two weeks' pace they're done ${formatDate(finish)}, ${plural(gap, "day")} after the ${formatDate(project.dueDate)} due date.`
}

/** A catch-up on one project, as an answer built from components. */
export function catchUp(project: Project, context: AssistantContext): Answer {
  const reference = context.referenceDate
  const owner = personName(context, project.ownerId)
  const now = standing(project, context)
  const weekStart = dateOffset(reference, -6)

  const events = context.activity
    .filter(
      (event) => event.projectId === project.id && event.date <= reference,
    )
    .sort((a, b) => b.date.localeCompare(a.date))

  const thisWeek = events.filter((event) => event.date >= weekStart)

  const files = context.files
    .filter((file) => file.projectId === project.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6)

  const remaining = now.unassigned.length
    ? `, ${now.unassigned.length} without an owner`
    : ""

  const prose = [
    `${owner}'s team completed **${plural(now.week, "task")}** in the last seven days ${citation(1, ["activity"])}.`,
    `**${plural(now.open.length, "task")}** ${now.open.length === 1 ? "remains" : "remain"}${remaining}.${paceSentence(project, now.finish)} ${citation(2, ["project"])}`,
  ].join(" ")

  const nodes = [
    node.heading("heading", {
      text: headline(project, now.finish),
      detail: `${now.done} of ${plural(now.total, "task")} done · ${statusLabels[project.status]} · owned by ${owner}`,
    }),
    node.text("summary", { markdown: prose }),
    node.figures("figures", {
      items: [
        {
          label: "Done",
          value: `${now.done} of ${now.total}`,
          trend: now.doneTrend,
          trendLabel: trendLabel(now.doneTrend, "30 days"),
        },
        {
          label: "Completed this week",
          value: String(now.week),
          trend: now.daily,
          trendLabel: "Tasks completed each day over the last two weeks",
        },
        {
          label: "Open",
          value: String(now.open.length),
          trend: now.openTrend,
          trendLabel: trendLabel(now.openTrend, "30 days"),
        },
        {
          label: "Due",
          value: formatDate(project.dueDate),
          detail: inDays(reference, project.dueDate),
        },
      ],
    }),
    ...(now.unassigned.length
      ? [
          node.callout("owners", {
            tone: "attention",
            title: `${plural(now.unassigned.length, "open task")} ${now.unassigned.length === 1 ? "has" : "have"} no owner`,
            markdown: `${now.unassigned
              .slice(0, 3)
              .map((task) => `- ${task.title}`)
              .join(
                "\n",
              )}\n\nAssign them on [${project.name}](${projectPath(project)}) so they don't wait.`,
          }),
        ]
      : []),
    ...(events.length
      ? [
          node.section("recent", { title: "Recent work" }, [
            node.activityDigest("activity", {
              items: events.slice(0, 5).map((event) => ({
                date: formatDate(event.date),
                person: personName(context, event.memberId),
                personHref: `${activityPath}?member=${encodeURIComponent(event.memberId)}`,
                action: actionWithinProject(event.action),
                detail: event.tasksCompleted
                  ? plural(event.tasksCompleted, "task")
                  : undefined,
              })),
              href: activityPath,
            }),
          ]),
        ]
      : []),
    ...(files.length
      ? [
          node.section("files", { title: "Files" }, [
            node.projectFiles("file-strip", {
              files: files.map((file) => ({
                name: file.name,
                kind: isImageFile(file) && file.url ? "image" : "document",
                url: isImageFile(file) && file.url ? file.url : undefined,
                detail: `${formatBytes(file.size)} · ${formatDate(file.date)}`,
              })),
              href: projectPath(project),
            }),
          ]),
        ]
      : []),
  ]

  return {
    todo: {
      title: `Catch up on ${project.name}`,
      tasks: [
        { label: "Read the project's tasks and activity", after: "steps" },
        { label: "Write the catch-up", after: "answer" },
      ],
    },
    steps: [
      {
        id: "tasks",
        label: `Read ${project.name}'s tasks`,
        results: [plural(now.total, "task"), `${now.open.length} open`],
      },
      {
        id: "activity",
        label: "Read its recent activity",
        results: [`${plural(thisWeek.length, "event")} this week`],
      },
    ],
    answer: { title: `Catch-up: ${project.name}`, nodes },
    text: "",
    sources: [
      {
        id: "activity",
        url: activityPath,
        title: "Activity",
        description: `${plural(thisWeek.length, "event")} for ${project.name} in the last seven days`,
      },
      {
        id: "project",
        url: projectPath(project),
        title: project.name,
        description: projectSummary(project),
      },
    ],
  }
}

/** A request to catch up: on the project named, or ask which first. */
export function catchUpAnswer(
  prompt: string,
  context: AssistantContext,
): Answer {
  const text = prompt.toLowerCase()

  const project = context.projects.find((item) =>
    text.includes(item.name.toLowerCase()),
  )

  return project
    ? catchUp(project, context)
    : askForProject(
        context,
        "catchup",
        "Which project should I catch you up on? I'll read its tasks, activity and files.",
      )
}
