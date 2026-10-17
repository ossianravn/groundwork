"use client"

import * as React from "react"
import { Brain, ChevronDown, PanelRight } from "lucide-react"
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
 * "Thought for 3 seconds". Opening or closing it by hand keeps that choice;
 * a host that keeps openness itself passes `open` and `onOpenChange`.
 * With `onOpenDetails`, the finished label opens the host's details view
 * (such as a side panel) instead of unfolding in place. It never takes
 * focus, so reading the conversation is not interrupted.
 */
function Reasoning({
  streaming = false,
  open: openProp,
  onOpenChange,
  label: labelProp,
  onOpenDetails,
  detailsLabel = "Open details",
  children,
  className,
}: {
  streaming?: boolean
  /** Holds it open or closed, for a host that keeps openness itself. */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Replaces the Thinking… and Thought for… wording. */
  label?: React.ReactNode
  /** Shows the finished reasoning elsewhere, such as in a side panel. */
  onOpenDetails?: () => void
  /** Names where `onOpenDetails` leads, for assistive technology. */
  detailsLabel?: string
  /** Markdown text of the reasoning part, or the host's own rendering of it. */
  children: React.ReactNode
  className?: string
}) {
  const auto = useAutoOpen(streaming)
  const seconds = useDuration(streaming)

  const label =
    labelProp ??
    (streaming
      ? "Thinking…"
      : seconds
        ? `Thought for ${seconds} second${seconds === 1 ? "" : "s"}`
        : "Reasoning")

  if (onOpenDetails && !streaming)
    return (
      <div data-slot="reasoning" className={cn("min-w-0", className)}>
        <button
          type="button"
          className="-ms-1 inline-flex min-h-(--control-height-sm) items-center gap-1.5 rounded-md px-1 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          onClick={onOpenDetails}
        >
          <Brain className="size-4" aria-hidden="true" />
          {label}
          <span className="sr-only">{`, ${detailsLabel}`}</span>
          <PanelRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    )

  return (
    <Collapsible
      data-slot="reasoning"
      open={openProp ?? auto.open}
      onOpenChange={(next) => {
        auto.onOpenChange(next)
        onOpenChange?.(next)
      }}
      className={cn("min-w-0", className)}
    >
      <CollapsibleTrigger className="group/reasoning -ms-1 inline-flex min-h-(--control-height-sm) items-center gap-1.5 rounded-md px-1 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
        <Brain className="size-4" aria-hidden="true" />
        {streaming ? <Shimmer variant="rainbow">{label}</Shimmer> : label}
        <ChevronDown
          className="size-4 transition-transform group-data-panel-open/reasoning:rotate-180"
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1 border-s-2 border-border ps-3 text-muted-foreground">
        {typeof children === "string" ? (
          <MessageResponse streaming={streaming}>{children}</MessageResponse>
        ) : (
          children
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}

export { Reasoning }
