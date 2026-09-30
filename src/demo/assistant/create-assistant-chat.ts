import { Chat } from "@ai-sdk/react"
import {
  lastAssistantMessageIsCompleteWithApprovalResponses,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai"
import { assistantReply } from "./assistant-answers"
import { createScriptedTransport } from "./assistant-transport"
import type { AssistantMessage } from "./assistant-types"
import { continueChecklist } from "./checklist-answer"

/**
 * A new conversation that answers from the scripted transport. Answering
 * the assistant's question or deciding on an approval sends automatically,
 * so the turn continues without another prompt.
 */
export function createAssistantChat(onStopped: (messageId: string) => void) {
  return new Chat<AssistantMessage>({
    transport: createScriptedTransport({
      reply: assistantReply,
      resume: continueChecklist,
    }),
    sendAutomaticallyWhen: (options) =>
      lastAssistantMessageIsCompleteWithToolCalls(options) ||
      lastAssistantMessageIsCompleteWithApprovalResponses(options),
    onFinish: ({ message, isAbort }) => {
      if (isAbort) onStopped(message.id)
    },
  })
}
