import { Clock, X } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/kit/ui/button"

export interface QueuedMessage {
  id: string
  text: string
}

/**
 * Messages written while the assistant could not take them: it was replying,
 * or waiting for an answer or approval. They are sent in order once it is
 * ready; each can be removed before then. Sits directly above the composer,
 * where they were written.
 */
function Queue({
  messages,
  label = "Sends when the reply finishes",
  onRemove,
  className,
}: {
  messages: QueuedMessage[]
  /** When the messages will be sent. */
  label?: string
  onRemove: (id: string) => void
  className?: string
}) {
  if (!messages.length) return null

  return (
    <section
      data-slot="queue"
      aria-label="Queued messages"
      className={cn(
        "grid gap-1 rounded-lg border border-border bg-background p-1 ps-3 text-sm",
        className,
      )}
    >
      <h3 className="flex items-center gap-1.5 pt-1 text-xs font-medium text-muted-foreground">
        <Clock className="size-3.5" aria-hidden="true" />
        {label}
      </h3>
      <ol className="grid">
        {messages.map((message) => (
          <li key={message.id} className="flex min-w-0 items-center gap-2">
            <span className="min-w-0 flex-1 truncate">{message.text}</span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground"
              aria-label={`Remove queued message: ${message.text}`}
              onClick={() => onRemove(message.id)}
            >
              <X aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ol>
    </section>
  )
}

export { Queue }
