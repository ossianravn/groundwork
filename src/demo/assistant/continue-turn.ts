import script from "../data/assistant.json"
import type {
  AssistantContext,
  AssistantMessage,
  Continuation,
} from "./assistant-types"
import { continueChecklist } from "./checklist-answer"
import { continuePlan } from "./plan-actions"

// After applying a plan, the questions that check its effect.
const planFollowUps =
  script.intents.find((intent) => intent.id === "land")?.followUps ?? []

/**
 * Continues a turn the person has just acted on: applying a plan, or the
 * question, plan and approval of the earlier answers.
 */
export function continueTurn(
  message: AssistantMessage,
  context: AssistantContext,
): Continuation | undefined {
  return (
    continuePlan(message, context, planFollowUps) ??
    continueChecklist(message, context)
  )
}
