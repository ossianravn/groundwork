import { z } from "zod"
import type { AnswerState } from "@/kit/answer/answer-library"
import { deferred, type PlanMoves } from "../capacity"
import type { Project } from "../model"
import { inWords, plural, projectLink, projectPath } from "./answer-format"
import type {
  AnswerActionData,
  AnswerStates,
  ApplyPlanInput,
  AssistantMessage,
  AssistantContext,
  AssistantReply,
  Continuation,
  ShowAnswerInput,
} from "./assistant-types"
import { lastStep } from "./checklist-answer"
import { landPlan } from "./land-answer"
import {
  projectPlanProps,
  teamPlanProps,
  type ProjectPlanProps,
} from "./plan-schemas"

type Answer = Omit<AssistantReply, "followUps">

/** The plan's edits as the answer keeps them, under its `plan` key. */
export const planMoves = z.record(z.string(), z.string())

const adjustValues = z.object({
  priority: z.enum(["date", "scope"]),
  helpers: z.array(z.string()),
})

const applyValues = z.object({ moves: planMoves })

/** An answer the conversation holds, with what the person changed in it. */
export interface HeldAnswer {
  toolCallId: string
  input: ShowAnswerInput
  state: AnswerState
}

/** The answers in a conversation, newest first. */
export function heldAnswers(
  messages: AssistantMessage[],
  states: AnswerStates,
): HeldAnswer[] {
  return messages
    .flatMap((message) =>
      message.parts.flatMap((part) =>
        part.type === "tool-showAnswer" && part.state === "output-available"
          ? [
              {
                toolCallId: part.toolCallId,
                input: part.input,
                state: states[part.toolCallId] ?? {},
              },
            ]
          : [],
      ),
    )
    .reverse()
}

/** A plan an answer holds: for one project, or across the team's. */
export interface HeldPlan {
  /** The project a plan is for; absent when it balances the team. */
  projectId?: string
  projects: { id: string; name: string }[]
  people: { id: string; name: string }[]
  changes: ProjectPlanProps["changes"]
}

/** The plan an answer holds, if it holds one. */
export function planOf(answer: HeldAnswer): HeldPlan | undefined {
  for (const node of answer.input.nodes) {
    const project =
      node.type === "ProjectPlan" && projectPlanProps.safeParse(node.props)

    if (project && project.success) {
      const { projectId, projectName, people, changes } = project.data

      return {
        projectId,
        projects: [{ id: projectId, name: projectName }],
        people,
        changes,
      }
    }

    const team = node.type === "TeamPlan" && teamPlanProps.safeParse(node.props)

    if (team && team.success) {
      const { projects, people, changes } = team.data

      return { projects, people, changes }
    }
  }

  return undefined
}

/** The moves the person ended with: their edits, or else the proposal. */
export function movesFrom(plan: HeldPlan, state: AnswerState) {
  const kept = planMoves.safeParse(state.plan)

  if (kept.success) return kept.data

  return Object.fromEntries(
    plan.changes.flatMap((change) =>
      change.proposed ? change.moves.map((move) => [move.taskId, move.to]) : [],
    ),
  )
}

/** Asks to apply a plan: what moves and what waits, for approval. */
export function applyRequest(
  answer: HeldAnswer,
  context: AssistantContext,
  moves?: PlanMoves,
): Answer {
  const plan = planOf(answer)

  const open = context.projects.filter(
    (project) =>
      project.status !== "completed" &&
      !!plan?.projects.some((item) => item.id === project.id),
  )

  if (!plan || !open.length)
    return { text: "The plan's projects can't change any more." }

  const chosen = moves ?? movesFrom(plan, answer.state)
  const names = new Map(plan.people.map((person) => [person.id, person.name]))

  // Tasks completed or removed since the plan was made are left alone.
  const tasks = context.tasks.filter(
    (task) =>
      !task.done && open.some((project) => project.id === task.projectId),
  )

  const moved = tasks.flatMap((task) => {
    const to = chosen[task.id]

    return to && to !== deferred && to !== task.assigneeId
      ? [{ ...taskOf(task), to, toName: names.get(to) ?? "Someone" }]
      : []
  })

  const waiting = tasks.flatMap((task) =>
    chosen[task.id] === deferred ? [taskOf(task)] : [],
  )

  const changed = open.flatMap((project) =>
    [...moved, ...waiting].some((task) => task.projectId === project.id)
      ? [{ id: project.id, name: project.name }]
      : [],
  )

  if (!changed.length)
    return {
      text: "The plan keeps every task where it is, so there's nothing to apply.",
    }

  return {
    text: `Here is what applying the plan changes in ${inWords(changed.map((project) => `**${project.name}**`))}. Nothing changes until you choose.`,
    applyPlan: { projects: changed, moves: moved, deferred: waiting },
  }
}

const taskOf = (task: { id: string; title: string; projectId: string }) => ({
  taskId: task.id,
  title: task.title,
  projectId: task.projectId,
})

/** What a choice sent from an answer leads to: a new plan, or applying it. */
export function answerAction(
  action: AnswerActionData,
  answer: HeldAnswer,
  context: AssistantContext,
): Answer | undefined {
  const plan = planOf(answer)

  if (action.nodeId === "adjust") {
    const project = context.projects.find((item) => item.id === plan?.projectId)
    const options = adjustValues.safeParse(action.values)

    return project && options.success
      ? landPlan(project, context, options.data)
      : undefined
  }

  if (action.nodeId === "apply") {
    const values = applyValues.safeParse(action.values)

    return applyRequest(
      answer,
      context,
      values.success ? values.data.moves : undefined,
    )
  }

  return undefined
}

/** What applying did, naming only the kinds of change the plan made. */
function appliedText(input: ApplyPlanInput, projects: Project[]) {
  const where = inWords(projects.map(projectLink))
  const moved = plural(input.moves.length, "task")
  const waiting = plural(input.deferred.length, "deferred task")

  if (!input.deferred.length) return `Done: I reassigned ${moved} in ${where}.`

  if (!input.moves.length)
    return `Done: I posted the ${waiting} to ${where} as a comment; they stay in the project.`

  return `Done: I reassigned ${moved} in ${where} and posted the ${waiting} as a comment; they stay in the project.`
}

/** Continues a turn after the person approved or declined applying a plan. */
export function continuePlan(
  message: AssistantMessage,
  context: AssistantContext,
  followUps: string[],
): Continuation | undefined {
  for (const part of lastStep(message)) {
    if (part.type !== "tool-applyPlan" || part.state !== "approval-responded")
      continue

    const { toolCallId, input } = part

    if (!part.approval.approved)
      return {
        answer: {
          resolution: { toolCallId, denied: true },
          text: "Okay, nothing changed. The plan is still above if you want to adjust it.",
          followUps,
        },
      }

    // Projects completed since the request are left as they are.
    const open = context.projects.filter(
      (project) =>
        project.status !== "completed" &&
        input.projects.some((item) => item.id === project.id),
    )

    const applies = (task: { projectId: string }) =>
      open.some((project) => project.id === task.projectId)

    const applied: ApplyPlanInput = {
      projects: input.projects.filter((item) =>
        open.some((project) => project.id === item.id),
      ),
      moves: input.moves.filter(applies),
      deferred: input.deferred.filter(applies),
    }

    return {
      run: open.length ? (actions) => actions.applyPlan(applied) : undefined,
      answer: {
        resolution: {
          toolCallId,
          output: {
            reassigned: applied.moves.length,
            deferred: applied.deferred.length,
            projects: open.map((project) => ({
              id: project.id,
              name: project.name,
              url: projectPath(project),
            })),
          },
        },
        text: open.length
          ? appliedText(applied, open)
          : `${inWords(input.projects.map((project) => project.name))} can't change any more, so nothing was applied.`,
        followUps,
      },
    }
  }

  return undefined
}
