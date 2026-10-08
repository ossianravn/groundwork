import script from "../data/assistant.json"
import type {
  AnswerActionData,
  AnswerStates,
  AssistantContext,
  AssistantMessage,
  AssistantReply,
  AssistantToolSettings,
} from "./assistant-types"
import { inWords } from "./answer-format"
import { balanceAnswer } from "./balance-answer"
import { catchUpAnswer } from "./catchup-answer"
import { landAnswer } from "./land-answer"
import { answerAction, applyRequest, heldAnswers, planOf } from "./plan-actions"
import { helpAnswer, namedGuide } from "./help-answer"
import { statusAnswer } from "./status-answer"
import { checklistAnswer } from "./checklist-answer"
import { riskAnswer } from "./risk-answer"
import { weekAnswer } from "./week-answer"

const intentIds = [
  "catchup",
  "land",
  "balance",
  "risk",
  "week",
  "status",
  "tasks",
  "api",
] as const

type IntentId = (typeof intentIds)[number]

function isIntentId(id: string | undefined): id is IntentId {
  return intentIds.some((known) => known === id)
}

/** Picks the scripted topic whose keywords appear as words in the prompt. */
export function matchIntent(prompt: string): IntentId | undefined {
  const words = new Set(prompt.toLowerCase().match(/[a-z]+/gu))

  const id = script.intents.find((intent) =>
    intent.keywords.some((keyword) => words.has(keyword)),
  )?.id

  return isIntentId(id) ? id : undefined
}

const listFiles = (files: string[]) =>
  inWords(files.map((name) => `**${name}**`))

function apiAnswer() {
  const { intro, curl, typescript, outro } = script.api

  return {
    text: [
      intro,
      "```bash\n" + curl + "\n```",
      "The same request from TypeScript:",
      "```ts\n" + typescript + "\n```",
      outro,
    ].join("\n\n"),
  }
}

const allTools: AssistantToolSettings = {
  searchProjects: true,
  createTasks: true,
  draftUpdates: true,
}

/** The tool an intent depends on, when the workspace can turn it off. */
function toolFor(intent: IntentId): keyof AssistantToolSettings | null {
  if (intent === "risk") return "searchProjects"

  if (intent === "tasks") return "createTasks"

  return intent === "status" ? "draftUpdates" : null
}

/**
 * Composes the scripted reply to a prompt from the records sent with the
 * request. `toolFails` makes the project search fail (tool-error scenario);
 * a tool turned off in settings gets an explanation instead of an answer.
 * A choice sent from an answer goes back to that answer, and asking to
 * apply works on the latest plan as the person left it.
 */
export function assistantReply(
  prompt: string,
  context: AssistantContext,
  {
    toolFails = false,
    files = [],
    tools = allTools,
    conversation = { messages: [], answers: {} },
    action,
  }: {
    toolFails?: boolean
    files?: string[]
    tools?: AssistantToolSettings
    conversation?: { messages: AssistantMessage[]; answers: AnswerStates }
    action?: AnswerActionData
  } = {},
): AssistantReply {
  const held = heldAnswers(conversation.messages, conversation.answers)

  const from =
    action && held.find((item) => item.toolCallId === action.answerId)

  const acted = action && from ? answerAction(action, from, context) : undefined

  if (acted) return withFollowUps(acted, followUpsOf("land"))

  const plan = held.find((item) => planOf(item))

  if (plan && /\bapply\b/iu.test(prompt))
    return withFollowUps(applyRequest(plan, context), followUpsOf("land"))

  const guide = namedGuide(prompt)

  if (guide) return { ...helpAnswer(guide), followUps: script.suggestions }

  const intent = matchIntent(prompt)

  if (!intent && files.length)
    return {
      text: script.files.replace("{files}", listFiles(files)),
      followUps: script.suggestions,
    }

  if (!intent) return { text: script.fallback, followUps: script.suggestions }

  const followUps = followUpsOf(intent)

  const tool = toolFor(intent)

  if (tool && !tools[tool]) return { text: script.disabled[tool], followUps }

  const answer =
    intent === "catchup"
      ? catchUpAnswer(prompt, context)
      : intent === "land"
        ? landAnswer(prompt, context)
        : intent === "balance"
          ? balanceAnswer(context)
          : intent === "risk"
            ? riskAnswer(context, { toolFails })
            : intent === "week"
              ? weekAnswer(context)
              : intent === "tasks"
                ? checklistAnswer(prompt, context)
                : intent === "status"
                  ? statusAnswer(prompt, context)
                  : apiAnswer()

  return withFollowUps(answer, followUps)
}

function followUpsOf(intent: IntentId) {
  return script.intents.find((entry) => entry.id === intent)?.followUps ?? []
}

/** A reply waiting on the person offers no other questions meanwhile. */
function withFollowUps(
  answer: Omit<AssistantReply, "followUps">,
  followUps: string[],
): AssistantReply {
  const waiting =
    "question" in answer || "approval" in answer || "applyPlan" in answer

  return { ...answer, followUps: waiting ? [] : followUps }
}
