import { paceByPerson, teamOutcome, type TeamLoad } from "../capacity"
import { formatDate, type Project } from "../model"
import { citation, daysBetween, inWords, plural } from "./answer-format"
import { node } from "./answer-schemas"
import type { AssistantContext, AssistantReply } from "./assistant-types"
import { proposeMoves } from "./balance-plan"
import { movesOf } from "./land-plan"
import { planNode } from "./plan-schemas"

type Answer = Omit<AssistantReply, "followUps">

const first = (name: string) => name.split(" ")[0] ?? name

const perWeek = (pace: number) => Math.round(pace * 7)

const assumption =
  "These dates assume each person works through their projects in due-date order at their pace over the last four weeks"

/**
 * What a team plan works from: everyone's pace, the open projects in
 * due-date order (with their tasks nobody holds) and the open tasks with
 * an owner.
 */
export function teamInputs(context: AssistantContext) {
  const pace = paceByPerson(context.tasks, context.referenceDate)

  const projects = context.projects
    .filter((project) => project.status !== "completed")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  const open = context.tasks.filter(
    (task) =>
      !task.done && projects.some((project) => project.id === task.projectId),
  )

  return {
    projects,
    people: context.people.map((person) => ({
      id: person.id,
      name: person.name,
      pace: pace.get(person.id) ?? 0,
    })),
    plan: projects.map(({ id, name, dueDate, color }) => ({
      id,
      name,
      dueDate,
      color,
      unowned: open.filter((task) => task.projectId === id && !task.assigneeId)
        .length,
    })),
    tasks: open.flatMap(({ id, title, projectId, assigneeId }) =>
      assigneeId ? [{ id, title, projectId, assigneeId }] : [],
    ),
  }
}

/**
 * Who is overloaded across the open projects, and the moves that would land
 * every project by its due date, as an interactive answer.
 */
export function balanceAnswer(context: AssistantContext): Answer {
  const reference = context.referenceDate
  const { projects, people, plan, tasks } = teamInputs(context)
  const changes = proposeMoves(people, plan, tasks, reference)
  const moves = movesOf(changes)
  const now = teamOutcome(people, plan, tasks, {}, reference)
  const planned = teamOutcome(people, plan, tasks, moves, reference)
  const project = (id: string) => projects.find((item) => item.id === id)

  const name = (id: string) =>
    people.find((p) => p.id === id)?.name ?? "Someone"

  // Days a part of someone's work lands after its project is due.
  const lateBy = (projectId: string, finish: string | null) => {
    const due = project(projectId)?.dueDate ?? reference

    return finish === null
      ? Number.MAX_SAFE_INTEGER
      : Math.max(0, daysBetween(due, finish))
  }

  const lateParts = (item: TeamLoad) =>
    item.projects
      .filter((part) => lateBy(part.projectId, part.finish) > 0)
      .sort(
        (a, b) => lateBy(b.projectId, b.finish) - lateBy(a.projectId, a.finish),
      )

  const lateness = (item: TeamLoad) =>
    Math.max(0, ...item.projects.map((p) => lateBy(p.projectId, p.finish)))

  const overloaded = now.load
    .filter((item) => lateness(item) > 0)
    .sort((a, b) => lateness(b) - lateness(a))

  const room = now.load.filter((item) => lateness(item) === 0)
  const late = projects.filter((item) => landing(planned, item) > item.dueDate)
  const unowned = plan.reduce((sum, item) => sum + item.unowned, 0)

  const helpers = [...new Set(Object.values(moves))].map((id) =>
    first(name(id)),
  )

  // Their latest late part, then why: how much work at what pace.
  const describe = (item: TeamLoad) => {
    const who = `**${first(name(item.personId))}**`
    const tasks = plural(item.tasks, "open task")
    const rate = people.find((p) => p.id === item.personId)?.pace ?? 0
    const worst = lateParts(item)[0]

    if (!rate || !worst?.finish)
      return `${who} has ${tasks} and completed none in four weeks, so they have no date`

    const days = plural(lateBy(worst.projectId, worst.finish), "day")

    return `${who}'s part of ${project(worst.projectId)?.name} ends ${formatDate(worst.finish)}, ${days} late: ${tasks} at about ${perWeek(rate)} a week`
  }

  const outcome = !overloaded.length
    ? "Nothing needs to move."
    : !changes.length
      ? "Nobody has room to take on their tasks in time, so dates need to move or work needs to wait."
      : late.length
        ? `With the ${plural(Object.keys(moves).length, "move")} below, ${inWords(late.map((item) => item.name))} still ${late.length > 1 ? "land" : "lands"} late.`
        : `With the ${plural(Object.keys(moves).length, "move")} below, every project lands by its due date.`

  const free = room.length
    ? ` ${inWords(room.map((item) => first(name(item.personId))))} ${room.length > 1 ? "finish" : "finishes"} everything by ${formatDate(
        room.reduce(
          (last, item) =>
            item.finish && item.finish > last ? item.finish : last,
          reference,
        ),
      )}.`
    : ""

  const owners = unowned
    ? `, and leave out the ${plural(unowned, "task")} without an owner`
    : ""

  const heading = overloaded.length
    ? {
        text: `${inWords(overloaded.map((item) => first(name(item.personId))))} ${overloaded.length > 1 ? "are" : "is"} overloaded`,
        detail: !changes.length
          ? "Nobody has room to take on their tasks in time"
          : late.length
            ? `With ${plural(Object.keys(moves).length, "move")}, ${inWords(late.map((item) => item.name))} still ${late.length > 1 ? "land" : "lands"} late`
            : `${plural(Object.keys(moves).length, "move")} to ${inWords(helpers)} land every project on time`,
      }
    : {
        text: "Nobody is overloaded",
        detail: "Every project lands by its due date as assigned",
      }

  const nodes = [
    node.heading("heading", heading),
    node.text("summary", {
      markdown: `${overloaded.length ? `As assigned, ${overloaded.map(describe).join(". ")} ${citation(1, ["workload"])}.` : `Everyone finishes their part of each project by its due date ${citation(1, ["workload"])}.`}${free} ${outcome} ${assumption}${owners} ${citation(2, ["activity"])}.`,
    }),
    planNode.team(
      "plan",
      { referenceDate: reference, people, projects: plan, tasks, changes },
      [
        planNode.load("load", { title: "Who has what" }),
        planNode.projects("projects", { title: "When each project lands" }),
        planNode.changes("changes", { title: "Suggested moves" }),
        planNode.apply("apply", { label: "Apply the moves" }),
      ],
    ),
  ]

  return {
    todo: {
      title: "Balance the team",
      tasks: [
        { label: "Read everyone's open tasks", after: "steps" },
        { label: "Measure each person's pace", after: "steps" },
        { label: "Propose moves", after: "answer" },
      ],
    },
    steps: [
      {
        id: "tasks",
        label: `Read open tasks across ${plural(projects.length, "project")}`,
        results: [`${tasks.length} with an owner`, `${unowned} without`],
      },
      {
        id: "pace",
        label: "Measured each person's pace over four weeks",
        results: people
          .filter((person) => person.pace > 0)
          .map(
            (person) => `${first(person.name)} ${perWeek(person.pace)} a week`,
          ),
      },
    ],
    answer: { title: "Plan for the team", nodes },
    text: "",
    sources: [
      {
        id: "workload",
        url: "/app/demo/analytics",
        title: "Workload",
        description: "Open tasks by person, across open projects",
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

/** When a project lands in an outcome; far off when nobody has a date. */
function landing(
  outcome: ReturnType<typeof teamOutcome>,
  project: Project,
): string {
  return (
    outcome.projects.find((item) => item.projectId === project.id)?.finish ??
    "9999-12-31"
  )
}
