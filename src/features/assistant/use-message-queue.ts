import { useEffect, useRef, useState } from "react"
import type { QueuedMessage } from "@/kit/ai/queue"

/**
 * Messages written while the assistant cannot take them (it is replying, or
 * waiting for an answer or approval). When it becomes ready, the first is
 * sent; the rest follow one reply at a time.
 */
export function useMessageQueue(ready: boolean, send: (text: string) => void) {
  const [queue, setQueue] = useState<QueuedMessage[]>([])
  const [next, setNext] = useState<QueuedMessage | null>(null)
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
    send(next.text)
  }, [next, send])

  return {
    queue,
    add: (text: string) =>
      setQueue((items) => [...items, { id: crypto.randomUUID(), text }]),
    remove: (id: string) =>
      setQueue((items) => items.filter((item) => item.id !== id)),
    clear: () => setQueue([]),
  }
}
