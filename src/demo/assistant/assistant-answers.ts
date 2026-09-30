import script from "../data/assistant.json"
import { formatDate, type Activity, type Member, type Project } from "../model"
import { dateOffset } from "../report-period"

/** What the scripted assistant can read: the live demo records. */
export interface AssistantContext {
  projects: Project[]
  activity: Activity[]
  people: Member[]
  referenceDate: string
}

export interface AssistantReply {
  /** Markdown. */
  text: string
  followUps: string[]
}

const intentIds = ["risk", "week", "api"] as const

type IntentId = (typeof intentIds)[number]

function isIntentId(id: string | undefined): id is IntentId {
  return intentIds.some((known) => known === id)
}

const projectPath = (project: Project) =>
  `/app/demo/projects/${encodeURIComponent(project.id)}`

const projectLink = (project: Project) =>
  `[${project.name}](${projectPath(project)})`

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`

function daysBetween(from: string, to: string) {
  return Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
      86_400_000,
  )
}

/** Picks the scripted topic whose keywords appear as words in the prompt. */
export function matchIntent(prompt: string): IntentId | undefined {
  const words = new Set(prompt.toLowerCase().match(/[a-z]+/gu))

  const id = script.intents.find((intent) =>
    intent.keywords.some((keyword) => words.has(keyword)),
  )?.id

  return isIntentId(id) ? id : undefined
}

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

function riskReply(context: AssistantContext) {
  const risks = atRiskProjects(context)
  const active = context.projects.filter((p) => p.status !== "completed")

  const owner = (id: string) =>
    context.people.find((person) => person.id === id)?.name ?? "A former member"

  const rule =
    "I count a project as at risk when it is overdue, due within a week with more than a quarter of its tasks open, or due within two weeks with more than half open."

  if (!risks.length)
    return `None of the ${plural(active.length, "active project")} looks at risk. ${rule}`

  const rows = risks.map(({ project, days, open }) => {
    const when =
      days < 0
        ? `${plural(-days, "day")} overdue`
        : days === 0
          ? "today"
          : `in ${plural(days, "day")}`

    return `| ${projectLink(project)} | ${owner(project.ownerId)} | ${formatDate(project.dueDate)} (${when}) | ${open} of ${project.tasks} |`
  })

  const first = risks[0]
  const others = active.length - risks.length

  return [
    `${risks.length === 1 ? "One project needs" : `${plural(risks.length, "project")} need`} attention. ${rule}`,
    [
      "| Project | Owner | Due | Open tasks |",
      "| --- | --- | --- | --- |",
      ...rows,
    ].join("\n"),
    `**${first.project.name}** is the most urgent: ${plural(first.open, "open task")} with ${first.days < 0 ? "its due date already passed" : `${plural(first.days, "day")} to go`}. ${others > 0 ? `The other ${plural(others, "active project")} ${others === 1 ? "is" : "are"} on track.` : ""}`.trim(),
  ].join("\n\n")
}

function weekReply(context: AssistantContext) {
  const start = dateOffset(context.referenceDate, -6)

  const events = context.activity.filter(
    (event) => event.date >= start && event.date <= context.referenceDate,
  )

  const completed = events.reduce((sum, event) => sum + event.tasksCompleted, 0)
  const range = `${formatDate(start)} – ${formatDate(context.referenceDate)}`

  if (!events.length)
    return `Nothing was recorded between ${range}. Activity appears here as the team completes tasks and updates projects.`

  const byProject = context.projects
    .map((project) => {
      const own = events.filter((event) => event.projectId === project.id)
      const tasks = own.reduce((sum, event) => sum + event.tasksCompleted, 0)

      const people = [...new Set(own.map((event) => event.memberId))].flatMap(
        (id) => context.people.find((person) => person.id === id)?.name ?? [],
      )

      return { project, tasks, updates: own.length, people }
    })
    .filter((entry) => entry.updates)
    .sort((a, b) => b.tasks - a.tasks || b.updates - a.updates)

  const lines = byProject.map(
    ({ project, tasks, updates, people }) =>
      `- ${projectLink(project)}: ${tasks ? `${plural(tasks, "task")} completed` : plural(updates, "update")}${people.length ? ` by ${people.join(" and ")}` : ""}`,
  )

  return [
    `Between ${range} the team completed **${plural(completed, "task")}** across ${plural(byProject.length, "project")}.`,
    lines.join("\n"),
    "The [Activity](/app/demo/activity) page has every event, with filters by person and project.",
  ].join("\n\n")
}

function apiReply() {
  const { intro, curl, typescript, outro } = script.api

  return [
    intro,
    "```bash\n" + curl + "\n```",
    "The same request from TypeScript:",
    "```ts\n" + typescript + "\n```",
    outro,
  ].join("\n\n")
}

export function assistantReply(
  prompt: string,
  context: AssistantContext,
): AssistantReply {
  const intent = matchIntent(prompt)

  if (!intent) return { text: script.fallback, followUps: script.suggestions }

  const followUps =
    script.intents.find((entry) => entry.id === intent)?.followUps ?? []

  const text =
    intent === "risk"
      ? riskReply(context)
      : intent === "week"
        ? weekReply(context)
        : apiReply()

  return { text, followUps }
}
