import type { ChatTransport, UIMessage, UIMessageChunk } from "ai"
import script from "../data/assistant.json"
import type { AssistantContext, AssistantReply } from "./assistant-answers"

/** Follow-up prompts arrive as a data part after the reply text. */
export type AssistantMessage = UIMessage<never, { suggestions: string[] }>

type AssistantChunk = UIMessageChunk<never, { suggestions: string[] }>

export interface Pace {
  /** Delay before the first words, while the reply is "submitted". */
  firstToken: number
  /** Delay between chunks of a few words. */
  chunk: number
}

export const defaultPace: Pace = { firstToken: 700, chunk: 28 }

export type AssistantScenario = "normal" | "assistant-error"

/**
 * What the host sends with each request, as a client would send page
 * context to a server: the records to answer from and the demo scenario.
 */
export interface AssistantRequest {
  scenario: AssistantScenario
  context: AssistantContext
}

function promptOf(message: AssistantMessage | undefined) {
  return (
    message?.parts
      .map((part) => (part.type === "text" ? part.text : ""))
      .join(" ") ?? ""
  )
}

/** Splits text into chunks of about three words, keeping every character. */
export function textChunks(text: string) {
  const words = text.match(/\s*\S+\s*/gu) ?? []
  const chunks: string[] = []

  for (let index = 0; index < words.length; index += 3)
    chunks.push(words.slice(index, index + 3).join(""))

  return chunks
}

/** The chunks a scripted reply streams, in AI SDK UI message stream order. */
export function replyChunks(
  reply: AssistantReply,
  fail: boolean,
): AssistantChunk[] {
  const text = textChunks(reply.text)
  const sent = fail ? text.slice(0, Math.ceil(text.length / 3)) : text

  return [
    { type: "start" },
    { type: "start-step" },
    { type: "text-start", id: "text" },
    ...sent.map((delta): AssistantChunk => ({
      type: "text-delta",
      id: "text",
      delta,
    })),
    ...(fail
      ? [{ type: "error", errorText: script.failure } as const]
      : ([
          { type: "text-end", id: "text" },
          ...(reply.followUps.length
            ? [
                {
                  type: "data-suggestions",
                  id: "suggestions",
                  data: reply.followUps,
                } as const,
              ]
            : []),
          { type: "finish-step" },
          { type: "finish", finishReason: "stop" },
        ] satisfies AssistantChunk[])),
  ]
}

/**
 * A ChatTransport that answers locally from a script instead of calling a
 * model, streaming at a readable pace. `useChat` treats it exactly like a
 * server: status, stop, regenerate and errors all behave as in production.
 * Send `{ body: { scenario: "assistant-error" } }` to fail the first attempt
 * at each prompt part-way through.
 */
export function createScriptedTransport({
  reply,
  pace = defaultPace,
}: {
  reply: (prompt: string, context: AssistantContext) => AssistantReply
  pace?: Pace
}): ChatTransport<AssistantMessage> {
  const failed = new Set<string>()

  return {
    async sendMessages({ messages, abortSignal, body }) {
      // SAFETY: the only sender is the assistant route, which always sends
      // an AssistantRequest body with sendMessage and regenerate.
      const request = body as AssistantRequest

      const prompt = [...messages]
        .reverse()
        .find((message) => message.role === "user")

      const fail =
        request.scenario === "assistant-error" &&
        !!prompt &&
        !failed.has(prompt.id)

      if (fail && prompt) failed.add(prompt.id)

      const chunks = replyChunks(reply(promptOf(prompt), request.context), fail)
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

            controller.enqueue(chunks[index])

            timer = setTimeout(
              () => send(index + 1),
              index < 2 ? 0 : pace.chunk,
            )
          }

          timer = setTimeout(() => send(0), pace.firstToken)
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
