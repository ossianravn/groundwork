import { useState } from "react"
import { Queue } from "@/kit/ai/queue"

export function QueueExample() {
  const [messages, setMessages] = useState([
    { id: "1", text: "What changed this week?" },
    { id: "2", text: "Which projects are at risk?" },
  ])

  return (
    <div className="grid max-w-xl gap-2">
      <Queue
        messages={messages}
        onRemove={(id) =>
          setMessages((items) => items.filter((item) => item.id !== id))
        }
      />
      {!messages.length && (
        <p className="text-sm text-muted-foreground">
          Nothing queued. Messages written during a reply wait here.
        </p>
      )}
    </div>
  )
}
