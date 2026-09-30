import type { ChatTransport } from "ai"
import { defaultPace, replyChunks, type Pace } from "./assistant-chunks"
import type {
  AssistantChunk,
  AssistantContext,
  AssistantMessage,
  AssistantReply,
  AssistantRequest,
  CreateTasksInput,
} from "./assistant-types"

function promptOf(message: AssistantMessage | undefined) {
  return (
    message?.parts
      .map((part) => (part.type === "text" ? part.text : ""))
      .join(" ") ?? ""
  )
}

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
 * streamed.
 */
export function createScriptedTransport({
  reply,
  resume,
  pace = defaultPace,
}: {
  reply: (
    prompt: string,
    context: AssistantContext,
    options: { toolFails: boolean },
  ) => AssistantReply
  resume: (
    message: AssistantMessage,
    context: AssistantContext,
  ) => { answer: AssistantReply; execute?: CreateTasksInput } | undefined
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

      if (resumed?.execute) request.actions.createTasks(resumed.execute)

      const fail = !resumed && first && request.scenario === "assistant-error"
      const toolFails = !resumed && first && request.scenario === "tool-error"

      const answer =
        resumed?.answer ??
        reply(promptOf(prompt), request.context, { toolFails })

      const chunks = replyChunks(answer, fail, pace, prompt?.id)
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
