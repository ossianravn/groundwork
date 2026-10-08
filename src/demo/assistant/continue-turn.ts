import script from "../data/assistant.json"
import type {
  AssistantContext,
  AssistantMessage,
  Continuation,
} from "./assistant-types"
import { continueChecklist } from "./checklist-answer"
import { continueLand } from "./land-apply"

const landFollowUps =
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
    continueLand(message, context, landFollowUps) ??
    continueChecklist(message, context)
  )
}
