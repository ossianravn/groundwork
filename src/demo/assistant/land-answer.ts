import { planOutcome, planPeople, type PlanPerson } from "../capacity"
import { formatDate, type Project } from "../model"
import { dateOffset } from "../report-period"
import { burnUp } from "../workload"
import {
  askForProject,
  citation,
  daysBetween,
  plural,
  projectPath,
  projectSummary,
} from "./answer-format"
import { node } from "./answer-schemas"
import type { AssistantContext, AssistantReply } from "./assistant-types"
import { movesOf, proposeChanges, type PlanOptions } from "./land-plan"
import { planNode } from "./plan-schemas"

type Answer = Omit<AssistantReply, "followUps">

const first = (person: PlanPerson | undefined) =>
  person?.name.split(" ")[0] ?? "Someone"

const day = (date: string | null) => (date ? formatDate(date) : "no known date")

const perWeek = (person: PlanPerson) => Math.round(person.pace * 7)

/** Who can help by default: free people who finish their earlier work in time. */
export function defaultHelpers(
  people: PlanPerson[],
  project: Project,
  context: AssistantContext,
) {
  return people.flatMap((person) =>
    person.pace > 0 &&
    !context.tasks.some(
      (task) =>
        task.projectId === project.id &&
        !task.done &&
        task.assigneeId === person.id,
    ) &&
    dateOffset(context.referenceDate, Math.ceil(person.before / person.pace)) <
      project.dueDate
      ? [person.id]
      : [],
  )
}

/** A plan to land a project by its due date, as an interactive answer. */
export function landPlan(
  project: Project,
  context: AssistantContext,
  chosen?: PlanOptions,
): Answer {
  const reference = context.referenceDate

  const people = planPeople(
    project,
    context.projects,
    context.tasks,
    context.people,
    reference,
  )

  const tasks = context.tasks
    .filter((task) => task.projectId === project.id && !task.done)
    .map(({ id, title, assigneeId }) => ({ id, title, assigneeId }))

  const options = chosen ?? {
    priority: "date" as const,
    helpers: defaultHelpers(people, project, context),
  }

  const changes = proposeChanges(
    people,
    tasks,
    project.dueDate,
    reference,
    options,
  )

  const proposed = changes.filter((change) => change.proposed)
  const now = planOutcome(people, tasks, {}, reference)
  const planned = planOutcome(people, tasks, movesOf(changes), reference)
  const team = burnUp(context.tasks, project, reference)
  const due = formatDate(project.dueDate)

  const late = (date: string | null) =>
    date && date > project.dueDate ? daysBetween(project.dueDate, date) : 0

  const bottleneck = [...now.load].sort((a, b) =>
    (b.finish ?? "~").localeCompare(a.finish ?? "~"),
  )[0]

  const slow = people.find((person) => person.id === bottleneck?.personId)

  const why = slow
    ? `: ${first(slow)} has ${plural(bottleneck?.tasks ?? 0, "task")} here${slow.before ? `, after ${slow.before} on a project due earlier,` : ""} completing about ${plural(perWeek(slow), "task")} a week`
    : ""

  const unowned = now.unowned
    ? `; ${plural(now.unowned, "task")} ${now.unowned === 1 ? "has" : "have"} no owner`
    : ""

  const fine = !late(now.finish) && !now.unowned

  const outcome = fine
    ? "Nothing needs to change."
    : proposed.length
      ? `With the ${plural(proposed.length, "change")} below it lands **${day(planned.finish)}**${late(planned.finish) ? `, still ${plural(late(planned.finish), "day")} late; adjust the plan to defer work or bring in more help` : ""}.`
      : "Nobody who can help has room, so adjust the plan to defer work or bring in more help."

  const assumption =
    "each person works through their projects in due-date order at their pace over the last four weeks"

  // When recent progress on this project tells a different story, say so.
  const basis =
    team.finish &&
    now.finish &&
    Math.abs(daysBetween(team.finish, now.finish)) > 2
      ? `At the team's pace on ${project.name} over the last two weeks it would finish ${day(team.finish)}; these dates assume ${assumption}`
      : `These dates assume ${assumption}`

  const heading = fine
    ? `${project.name} lands ${day(now.finish)} as assigned`
    : planned.finish && !late(planned.finish)
      ? `${project.name} can land ${day(planned.finish)}${planned.finish === project.dueDate ? ", on its due date" : `, ${plural(daysBetween(planned.finish, project.dueDate), "day")} early`}`
      : `${project.name} can't land by ${due} with this help`

  const history = team.points.filter(
    (point) => point.date <= reference && point.done !== undefined,
  )

  const nodes = [
    node.heading("heading", {
      text: heading,
      detail: `As assigned ${day(now.finish)} · due ${due} · ${plural(tasks.length, "open task")}`,
    }),
    node.text("summary", {
      markdown: `As assigned, ${project.name} lands **${day(now.finish)}**${late(now.finish) ? `, ${plural(late(now.finish), "day")} late` : ""}${why}${unowned} ${citation(1, ["project"])}. ${outcome} ${basis} ${citation(2, ["activity"])}.`,
    }),
    planNode.plan(
      "plan",
      {
        projectId: project.id,
        projectName: project.name,
        dueDate: project.dueDate,
        referenceDate: reference,
        people,
        tasks,
        history: history
          .filter((_, index) => (history.length - 1 - index) % 3 === 0)
          .slice(-16)
          .map((point) => ({
            date: point.date,
            done: point.done ?? 0,
            scope: point.scope ?? 0,
          })),
        changes,
      },
      [
        planNode.projection("projection", { title: "Projection" }),
        planNode.load("load", { title: "Who finishes when" }),
        planNode.changes("changes", { title: "Changes" }),
        planNode.apply("apply", { label: "Apply the plan" }),
      ],
    ),
    node.form("adjust", {
      title: "Adjust the plan",
      submitLabel: "Update the plan",
      fields: [
        {
          kind: "choice",
          name: "priority",
          label: "Priority",
          options: [
            { value: "date", label: `Hit ${due}` },
            { value: "scope", label: "Keep every task" },
          ],
          value: options.priority,
        },
        {
          kind: "checks",
          name: "helpers",
          label: "Who can help",
          options: people.map((person) => ({
            value: person.id,
            label: person.name,
          })),
          values: options.helpers,
        },
      ],
    }),
  ]

  return {
    todo: {
      title: `Plan to land ${project.name}`,
      tasks: [
        { label: "Read the open tasks and who has them", after: "steps" },
        { label: "Measure each person's pace", after: "steps" },
        { label: "Propose changes", after: "answer" },
      ],
    },
    steps: [
      {
        id: "tasks",
        label: `Read ${project.name}'s open tasks`,
        results: [
          `${tasks.length} open`,
          now.unowned ? `${now.unowned} without an owner` : "all assigned",
        ],
      },
      {
        id: "pace",
        label: "Measured each person's pace over four weeks",
        results: people
          .filter((person) => person.pace > 0)
          .map((person) => `${first(person)} ${perWeek(person)} a week`),
      },
    ],
    answer: { title: `Plan for ${project.name}`, nodes },
    text: "",
    sources: [
      {
        id: "project",
        url: projectPath(project),
        title: project.name,
        description: projectSummary(project),
      },
      {
        id: "activity",
        url: "/app/demo/activity",
        title: "Activity",
        description: "Completed tasks over the last four weeks, by person",
      },
    ],
  }
}

/** A request to land a project: plan the one named, or ask which. */
export function landAnswer(prompt: string, context: AssistantContext): Answer {
  const text = prompt.toLowerCase()

  const project = context.projects.find(
    (item) =>
      item.status !== "completed" && text.includes(item.name.toLowerCase()),
  )

  return project
    ? landPlan(project, context)
    : askForProject(
        context,
        "land",
        "Which project should I plan? I'll check who can finish what by its due date.",
      )
}
