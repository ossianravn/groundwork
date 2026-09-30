import { useCallback, useState } from "react"
import type { Chat } from "@ai-sdk/react"
import { defaultModel } from "./assistant-model"
import type { AssistantMessage, ModelId } from "./assistant-types"

type AssistantChat = Chat<AssistantMessage>

export interface Conversation {
  id: string
  /** Set by renaming; otherwise the title comes from the first question. */
  title: string | null
  chat: AssistantChat | null
  /** Replies the person stopped before they finished. */
  stopped: string[]
  /** Earlier replies to a question, by the question's message id. */
  versions: Record<string, AssistantMessage[]>
}

const blank = (): Conversation => ({
  id: crypto.randomUUID(),
  title: null,
  chat: null,
  stopped: [],
  versions: {},
})

/** A conversation's name in the history list. */
export function conversationTitle(conversation: Conversation) {
  const first = conversation.chat?.messages
    .find((message) => message.role === "user")
    ?.parts.flatMap((part) => (part.type === "text" ? part.text : []))
    .join(" ")

  return conversation.title ?? (first || "New chat")
}

/**
 * The workspace assistant's conversations, held with the rest of the demo
 * state so they survive navigation; reload or Reset starts over. Each Chat
 * is created by the lazily loaded assistant page (`create-assistant-chat.ts`),
 * which keeps the AI SDK out of the main bundle; this owner only keeps it.
 */
export function useAssistant() {
  const [state, setState] = useState(() => {
    const first = blank()

    return { conversations: [first], activeId: first.id }
  })

  // The model is a preference: it outlasts New chat, not a reload.
  const [model, setModel] = useState<ModelId>(defaultModel)

  const update = useCallback(
    (id: string, change: (conversation: Conversation) => Conversation) =>
      setState((current) => ({
        ...current,
        conversations: current.conversations.map((item) =>
          item.id === id ? change(item) : item,
        ),
      })),
    [],
  )

  const adopt = useCallback(
    (id: string, chat: AssistantChat) =>
      update(id, (item) => (item.chat ? item : { ...item, chat })),
    [update],
  )

  const markStopped = useCallback(
    (id: string, messageId: string) =>
      update(id, (item) => ({
        ...item,
        stopped: [...item.stopped, messageId],
      })),
    [update],
  )

  const active =
    state.conversations.find((item) => item.id === state.activeId) ??
    state.conversations[0]

  const used = (item: Conversation) => !!item.chat?.messages.length

  return {
    active,
    /**
     * Conversations with at least one message, newest first. A function,
     * because messages live in each Chat and are read when rendering.
     */
    history: () => state.conversations.filter(used).reverse(),
    model,
    setModel,
    adopt,
    markStopped,
    select: (id: string) =>
      setState((current) => ({ ...current, activeId: id })),
    /** Starts a new conversation, unless the current one is still empty. */
    newChat: () => {
      if (!used(active)) return

      const next = blank()

      setState((current) => ({
        conversations: [...current.conversations, next],
        activeId: next.id,
      }))
    },
    rename: (id: string, title: string) =>
      update(id, (item) => ({ ...item, title: title.trim() || null })),
    /** Removes a conversation; returns what Undo needs to put it back. */
    remove: (id: string) => {
      const index = state.conversations.findIndex((item) => item.id === id)
      const removed = state.conversations[index]
      const rest = state.conversations.filter((item) => item.id !== id)
      const fallback = rest.find((item) => !used(item)) ?? blank()

      void removed?.chat?.stop()
      setState({
        conversations: rest.includes(fallback) ? rest : [...rest, fallback],
        activeId: id === state.activeId ? fallback.id : state.activeId,
      })

      return { removed, index }
    },
    restore: (conversation: Conversation, index: number) =>
      setState((current) => ({
        conversations: [
          ...current.conversations.slice(0, index),
          conversation,
          ...current.conversations.slice(index),
        ],
        activeId: conversation.id,
      })),
    /** Keeps a reply as an earlier version of the answer to a question. */
    keepVersion: (id: string, questionId: string, reply: AssistantMessage) =>
      update(id, (item) => {
        const list = item.versions[questionId] ?? []

        return list.some((version) => version.id === reply.id)
          ? item
          : {
              ...item,
              versions: { ...item.versions, [questionId]: [...list, reply] },
            }
      }),
    reset: () => {
      state.conversations.forEach((item) => void item.chat?.stop())

      const first = blank()

      setState({ conversations: [first], activeId: first.id })
    },
  }
}
