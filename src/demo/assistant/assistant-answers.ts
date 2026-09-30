import script from "../data/assistant.json"
import type {
  AssistantContext,
  AssistantReply,
  AssistantToolSettings,
} from "./assistant-types"
import { helpAnswer, namedGuide } from "./help-answer"
import { statusAnswer } from "./status-answer"
import { checklistAnswer } from "./checklist-answer"
import { riskAnswer } from "./risk-answer"
import { weekAnswer } from "./week-answer"

const intentIds = ["risk", "week", "status", "tasks", "api"] as const

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

function listFiles(files: string[]) {
  const names = files.map((name) => `**${name}**`)

  return names.length > 1
    ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
    : names[0]
}

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
 */
export function assistantReply(
  prompt: string,
  context: AssistantContext,
  {
    toolFails = false,
    files = [],
    tools = allTools,
  }: {
    toolFails?: boolean
    files?: string[]
    tools?: AssistantToolSettings
  } = {},
): AssistantReply {
  const guide = namedGuide(prompt)

  if (guide) return { ...helpAnswer(guide), followUps: script.suggestions }

  const intent = matchIntent(prompt)

  if (!intent && files.length)
    return {
      text: script.files.replace("{files}", listFiles(files)),
      followUps: script.suggestions,
    }

  if (!intent) return { text: script.fallback, followUps: script.suggestions }

  const followUps =
    script.intents.find((entry) => entry.id === intent)?.followUps ?? []

  const tool = toolFor(intent)

  if (tool && !tools[tool]) return { text: script.disabled[tool], followUps }

  const answer =
    intent === "risk"
      ? riskAnswer(context, { toolFails })
      : intent === "week"
        ? weekAnswer(context)
        : intent === "tasks"
          ? checklistAnswer(prompt, context)
          : intent === "status"
            ? statusAnswer(prompt, context)
            : apiAnswer()

  // A reply waiting on the person offers no other questions meanwhile.
  const waiting = "question" in answer || "approval" in answer

  return { ...answer, followUps: waiting ? [] : followUps }
}
