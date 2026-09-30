import * as React from "react"
import { Brain, ChevronDown } from "lucide-react"
import { cn } from "cn"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/kit/ui/collapsible"
import { Shimmer } from "@/kit/ui/shimmer"
import { MessageResponse } from "@/kit/ai/message-response"
import { useAutoOpen } from "@/kit/ai/use-auto-open"

/** Measures how long the model reasoned, from the stream starting to ending. */
function useDuration(streaming: boolean) {
  const started = React.useRef<number | null>(null)
  const [seconds, setSeconds] = React.useState<number>()

  React.useEffect(() => {
    if (streaming) {
      started.current = performance.now()

      return
    }

    if (started.current === null) return

    const elapsed = performance.now() - started.current
    started.current = null

    // Reported after the frame, so the label changes once, with the close.
    const frame = requestAnimationFrame(() =>
      setSeconds(Math.max(1, Math.round(elapsed / 1000))),
    )

    return () => cancelAnimationFrame(frame)
  }, [streaming])

  return seconds
}

/**
 * A model's reasoning: open while it streams, then folded away behind
 * "Thought for 3 seconds". Opening or closing it by hand keeps that choice.
 * It never takes focus, so reading the conversation is not interrupted.
 */
function Reasoning({
  streaming = false,
  children,
  className,
}: {
  streaming?: boolean
  /** Markdown text of the reasoning part. */
  children: string
  className?: string
}) {
  const { open, onOpenChange } = useAutoOpen(streaming)
  const seconds = useDuration(streaming)

  const label = streaming
    ? "Thinking…"
    : seconds
      ? `Thought for ${seconds} second${seconds === 1 ? "" : "s"}`
      : "Reasoning"

  return (
    <Collapsible
      data-slot="reasoning"
      open={open}
      onOpenChange={onOpenChange}
      className={cn("min-w-0", className)}
    >
      <CollapsibleTrigger className="group/reasoning -ms-1 inline-flex min-h-(--control-height-sm) items-center gap-1.5 rounded-md px-1 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
        <Brain className="size-4" aria-hidden="true" />
        {streaming ? <Shimmer>{label}</Shimmer> : label}
        <ChevronDown
          className="size-4 transition-transform group-data-panel-open/reasoning:rotate-180"
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1 border-s-2 border-border ps-3 text-muted-foreground">
        <MessageResponse streaming={streaming}>{children}</MessageResponse>
      </CollapsibleContent>
    </Collapsible>
  )
}

export { Reasoning }
