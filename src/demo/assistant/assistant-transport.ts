import type { ChatTransport } from "ai"
import { replyChunks, type Pace } from "./assistant-chunks"
import {
  actionOf,
  estimateUsage,
  filesOf,
  modelPace,
  promptOf,
  replyForModel,
} from "./assistant-model"
import type {
  AnswerActionData,
  AnswerStates,
  AssistantChunk,
  AssistantContext,
  AssistantMessage,
  AssistantReply,
  AssistantRequest,
  AssistantToolSettings,
  Continuation,
} from "./assistant-types"

/**
 * A ChatTransport that answers locally from a script instead of calling a
 * model, streaming at a readable pace. `useChat` treats it exactly like a
 * server: status, stop, regenerate and errors all behave as in production.
 * The request's scenario fails the first attempt at each prompt: the stream
 * (assistant-error) or the project search (tool-error).
 *
 * When the last message is the assistant's, the person has answered its
 * question or decided on an approval: `resume` continues that turn, and an
 * approved call runs through the request's actions before its outcome is
 * streamed. Replies also see the conversation with what the person changed
 * in its answers, and any choice they sent from one.
 */
export function createScriptedTransport({
  reply,
  resume,
  pace,
}: {
  reply: (
    prompt: string,
    context: AssistantContext,
    options: {
      toolFails: boolean
      files: string[]
      tools: AssistantToolSettings
      conversation: { messages: AssistantMessage[]; answers: AnswerStates }
      action?: AnswerActionData
    },
  ) => AssistantReply
  resume: (
    message: AssistantMessage,
    context: AssistantContext,
  ) => Continuation | undefined
  /** Overrides the chosen model's pace, as tests do. */
  pace?: Pace
}): ChatTransport<AssistantMessage> {
  const attempted = new Set<string>()

  return {
    async sendMessages({ messages, abortSignal, body }) {
      // SAFETY: the only sender is the assistant route, which always sends
      // an AssistantRequest body with sendMessage and regenerate.
      const request = body as AssistantRequest

      const prompt = [...messages]
        .reverse()
        .find((message) => message.role === "user")

      const first = !!prompt && !attempted.has(prompt.id)

      if (prompt) attempted.add(prompt.id)

      const last = messages[messages.length - 1]

      const resumed =
        last?.role === "assistant" ? resume(last, request.context) : undefined

      resumed?.run?.(request.actions)

      const fail = !resumed && first && request.scenario === "assistant-error"
      const toolFails = !resumed && first && request.scenario === "tool-error"

      const answer = replyForModel(
        resumed?.answer ??
          reply(promptOf(prompt), request.context, {
            toolFails,
            files: filesOf(prompt),
            tools: request.tools,
            conversation: { messages, answers: request.answers },
            action: actionOf(prompt),
          }),
        request.model,
      )

      const chunks = replyChunks(
        answer,
        fail,
        pace ?? modelPace(request.model),
        prompt?.id,
        estimateUsage(messages, answer, request.model),
      )

      let timer: ReturnType<typeof setTimeout> | undefined
      let open = true

      return new ReadableStream<AssistantChunk>({
        start(controller) {
          const stop = () => {
            if (!open) return
            open = false
            clearTimeout(timer)
            controller.error(new DOMException("Stopped", "AbortError"))
          }

          if (abortSignal?.aborted) return stop()

          abortSignal?.addEventListener("abort", stop, { once: true })

          const send = (index: number) => {
            if (!open) return

            if (index === chunks.length) {
              open = false
              abortSignal?.removeEventListener("abort", stop)
              controller.close()

              return
            }

            controller.enqueue(chunks[index].chunk)

            timer = setTimeout(
              () => send(index + 1),
              chunks[index + 1]?.delay ?? 0,
            )
          }

          timer = setTimeout(() => send(0), chunks[0]?.delay ?? 0)
        },
        cancel() {
          open = false
          clearTimeout(timer)
        },
      })
    },
    async reconnectToStream() {
      return null
    },
  }
}
