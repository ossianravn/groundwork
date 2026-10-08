import { z } from "zod"
import type { AnswerState } from "@/kit/answer/answer-library"
import { deferred, type PlanMoves } from "../capacity"
import { plural, projectLink, projectPath } from "./answer-format"
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
import { projectPlanProps, type ProjectPlanProps } from "./plan-schemas"

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

/** The plan an answer holds, if it holds one. */
export function planOf(answer: HeldAnswer): ProjectPlanProps | undefined {
  const found = answer.input.nodes.find((item) => item.type === "ProjectPlan")
  const parsed = projectPlanProps.safeParse(found?.props)

  return parsed.success ? parsed.data : undefined
}

/** The moves the person ended with: their edits, or else the proposal. */
export function movesFrom(plan: ProjectPlanProps, state: AnswerState) {
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
  const project = context.projects.find((item) => item.id === plan?.projectId)

  if (!plan || !project)
    return { text: "That plan's project is no longer in the workspace." }

  if (project.status === "completed")
    return { text: `${project.name} is completed, so its tasks can't change.` }

  const chosen = moves ?? movesFrom(plan, answer.state)
  const names = new Map(plan.people.map((person) => [person.id, person.name]))

  // Tasks completed or removed since the plan was made are left alone.
  const open = context.tasks.filter(
    (task) => task.projectId === project.id && !task.done,
  )

  const input: ApplyPlanInput = {
    projectId: project.id,
    projectName: project.name,
    moves: open.flatMap((task) => {
      const to = chosen[task.id]

      return to && to !== deferred && to !== task.assigneeId
        ? [
            {
              taskId: task.id,
              title: task.title,
              to,
              toName: names.get(to) ?? "Someone",
            },
          ]
        : []
    }),
    deferred: open.flatMap((task) =>
      chosen[task.id] === deferred
        ? [{ taskId: task.id, title: task.title }]
        : [],
    ),
  }

  if (!input.moves.length && !input.deferred.length)
    return {
      text: "The plan keeps every task where it is, so there's nothing to apply.",
    }

  return {
    text: `Here is what applying the plan changes in **${project.name}**. Nothing changes until you choose.`,
    applyPlan: input,
  }
}

/** What a choice sent from an answer leads to: a new plan, or applying it. */
export function answerAction(
  action: AnswerActionData,
  answer: HeldAnswer,
  context: AssistantContext,
): Answer | undefined {
  const plan = planOf(answer)
  const project = context.projects.find((item) => item.id === plan?.projectId)

  if (action.nodeId === "adjust") {
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
function appliedText(input: ApplyPlanInput, link: string) {
  const moved = plural(input.moves.length, "task")
  const waiting = plural(input.deferred.length, "deferred task")

  if (!input.deferred.length) return `Done: I reassigned ${moved} in ${link}.`

  if (!input.moves.length)
    return `Done: I posted the ${waiting} to ${link} as a comment; they stay in the project.`

  return `Done: I reassigned ${moved} in ${link} and posted the ${waiting} as a comment; they stay in the project.`
}

/** Continues a turn after the person approved or declined applying a plan. */
export function continueLand(
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

    const project = context.projects.find((item) => item.id === input.projectId)
    const open = !!project && project.status !== "completed"

    return {
      run: open ? (actions) => actions.applyPlan(input) : undefined,
      answer: {
        resolution: {
          toolCallId,
          output: {
            reassigned: open ? input.moves.length : 0,
            deferred: open ? input.deferred.length : 0,
            projectId: input.projectId,
            projectName: input.projectName,
            url: project ? projectPath(project) : "",
          },
        },
        text:
          open && project
            ? appliedText(input, projectLink(project))
            : `${input.projectName} can't change any more, so nothing was applied.`,
        followUps,
      },
    }
  }

  return undefined
}
