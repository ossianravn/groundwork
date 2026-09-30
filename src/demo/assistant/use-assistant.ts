import { useCallback, useState } from "react"
import type { Chat } from "@ai-sdk/react"
import type { AssistantMessage } from "./assistant-types"

type AssistantChat = Chat<AssistantMessage>

/**
 * The workspace assistant's conversation, held with the rest of the demo
 * state so it survives navigation. The Chat itself is created by the lazily
 * loaded assistant page (`create-assistant-chat.ts`), which keeps the AI SDK
 * out of the main bundle; this owner only keeps it. Each new conversation
 * gets a new generation, so the page knows to start a fresh Chat.
 */
export function useAssistant() {
  const [session, setSession] = useState<{
    chat: AssistantChat | null
    stopped: string[]
    generation: number
  }>({ chat: null, stopped: [], generation: 0 })

  const adopt = useCallback(
    (chat: AssistantChat) =>
      setSession((current) => (current.chat ? current : { ...current, chat })),
    [],
  )

  const markStopped = useCallback(
    (id: string) =>
      setSession((current) => ({
        ...current,
        stopped: [...current.stopped, id],
      })),
    [],
  )

  function restart() {
    void session.chat?.stop()
    setSession((current) => ({
      chat: null,
      stopped: [],
      generation: current.generation + 1,
    }))
  }

  return {
    chat: session.chat,
    generation: session.generation,
    /** Replies the person stopped before they finished. */
    stopped: session.stopped,
    adopt,
    markStopped,
    newChat: restart,
    reset: restart,
  }
}
