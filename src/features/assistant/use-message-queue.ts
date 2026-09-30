import { useEffect, useRef, useState } from "react"
import type { PromptSubmission } from "@/kit/ai/prompt-input"

interface Queued {
  id: string
  submission: PromptSubmission
}

/** How a queued message reads in the queue: its words, or what it carries. */
function summary({ text, files, references }: PromptSubmission) {
  const attached = files.length + references.length

  const extra = attached
    ? `${attached} attachment${attached === 1 ? "" : "s"}`
    : ""

  return [text, extra].filter(Boolean).join(" · ")
}

/**
 * Messages written while the assistant cannot take them (it is replying, or
 * waiting for an answer or approval). When it becomes ready, the first is
 * sent; the rest follow one reply at a time.
 */
export function useMessageQueue(
  ready: boolean,
  send: (submission: PromptSubmission) => void,
) {
  const [queue, setQueue] = useState<Queued[]>([])
  const [next, setNext] = useState<Queued | null>(null)
  const [wasReady, setWasReady] = useState(ready)
  const sent = useRef<string | null>(null)

  // Becoming ready takes the first queued message off the queue.
  if (wasReady !== ready) {
    setWasReady(ready)

    if (ready && queue.length) {
      setNext(queue[0])
      setQueue(queue.slice(1))
    }
  }

  useEffect(() => {
    if (!next || sent.current === next.id) return

    sent.current = next.id
    send(next.submission)
  }, [next, send])

  return {
    messages: queue.map(({ id, submission }) => ({
      id,
      text: summary(submission),
    })),
    add: (submission: PromptSubmission) =>
      setQueue((items) => [...items, { id: crypto.randomUUID(), submission }]),
    remove: (id: string) =>
      setQueue((items) => items.filter((item) => item.id !== id)),
    clear: () => setQueue([]),
  }
}
