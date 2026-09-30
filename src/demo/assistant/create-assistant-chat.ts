import { Chat } from "@ai-sdk/react"
import { assistantReply } from "./assistant-answers"
import {
  createScriptedTransport,
  type AssistantMessage,
} from "./assistant-transport"

/** A new conversation that answers from the scripted transport. */
export function createAssistantChat(onStopped: (messageId: string) => void) {
  return new Chat<AssistantMessage>({
    transport: createScriptedTransport({ reply: assistantReply }),
    onFinish: ({ message, isAbort }) => {
      if (isAbort) onStopped(message.id)
    },
  })
}
