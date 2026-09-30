import script from "../data/assistant.json"
import type { AssistantContext, AssistantReply } from "./assistant-types"
import { riskAnswer } from "./risk-answer"
import { weekAnswer } from "./week-answer"

const intentIds = ["risk", "week", "api"] as const

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

/**
 * Composes the scripted reply to a prompt from the records sent with the
 * request. `toolFails` makes the project search fail (tool-error scenario).
 */
export function assistantReply(
  prompt: string,
  context: AssistantContext,
  { toolFails = false }: { toolFails?: boolean } = {},
): AssistantReply {
  const intent = matchIntent(prompt)

  if (!intent) return { text: script.fallback, followUps: script.suggestions }

  const followUps =
    script.intents.find((entry) => entry.id === intent)?.followUps ?? []

  const answer =
    intent === "risk"
      ? riskAnswer(context, { toolFails })
      : intent === "week"
        ? weekAnswer(context)
        : apiAnswer()

  return { ...answer, followUps }
}
