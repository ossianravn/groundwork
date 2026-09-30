import * as React from "react"
import { ChevronDown, CircleCheck, Circle, ListChecks } from "lucide-react"
import { cn } from "cn"
import { Badge } from "@/kit/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/kit/ui/collapsible"
import { Shimmer } from "@/kit/ui/shimmer"
import { Spinner } from "@/kit/ui/spinner"
import { useAutoOpen } from "@/kit/ai/use-auto-open"

export type StepStatus = "complete" | "active" | "pending"

const statusLabels = {
  complete: "Done",
  active: "In progress",
  pending: "Not done",
} satisfies Record<StepStatus, string>

/**
 * The steps an agent works through, reported as it goes. Open while a step
 * is in progress and folded away once all are done, like Reasoning. For the
 * technical detail of a single call, use Tool instead.
 */
function ChainOfThought({
  label,
  active = false,
  children,
  className,
}: {
  /** Says what happened, such as "Worked through 3 steps". */
  label: string
  /** A step is still running. */
  active?: boolean
  children: React.ReactNode
  className?: string
}) {
  const { open, onOpenChange } = useAutoOpen(active)

  return (
    <Collapsible
      data-slot="chain-of-thought"
      open={open}
      onOpenChange={onOpenChange}
      className={cn("min-w-0", className)}
    >
      <CollapsibleTrigger className="group/steps -ms-1 inline-flex min-h-(--control-height-sm) items-center gap-1.5 rounded-md px-1 text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
        <ListChecks className="size-4" aria-hidden="true" />
        {active ? <Shimmer>{label}</Shimmer> : label}
        <ChevronDown
          className="size-4 transition-transform group-data-panel-open/steps:rotate-180"
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ol className="mt-1 grid gap-3">{children}</ol>
      </CollapsibleContent>
    </Collapsible>
  )
}

function ChainOfThoughtStep({
  status,
  label,
  description,
  children,
}: {
  status: StepStatus
  label: string
  description?: string
  /** Results, such as ChainOfThoughtResults. */
  children?: React.ReactNode
}) {
  return (
    <li
      data-slot="chain-of-thought-step"
      data-status={status}
      className="relative grid grid-cols-[1rem_minmax(0,1fr)] gap-x-2 text-sm before:absolute before:start-[0.4375rem] before:top-5 before:bottom-[-0.75rem] before:w-px before:bg-border last:before:hidden"
    >
      <span className="flex h-5 items-center text-muted-foreground">
        {status === "complete" ? (
          <CircleCheck className="size-4" aria-hidden="true" />
        ) : status === "active" ? (
          <Spinner className="size-4" role="presentation" aria-hidden="true" />
        ) : (
          <Circle className="size-4 opacity-50" aria-hidden="true" />
        )}
      </span>
      <div className="grid min-w-0 gap-1">
        <p
          className={cn(
            "leading-5",
            status === "pending" ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {label}
          <span className="sr-only">, {statusLabels[status]}</span>
        </p>
        {description && <p className="text-muted-foreground">{description}</p>}
        {children}
      </div>
    </li>
  )
}

/** What a step found, as quiet chips. */
function ChainOfThoughtResults({ items }: { items: string[] }) {
  if (!items.length) return null

  return (
    <ul className="flex flex-wrap gap-1" aria-label="Results">
      {items.map((item) => (
        <li key={item}>
          <Badge variant="secondary" className="font-normal">
            {item}
          </Badge>
        </li>
      ))}
    </ul>
  )
}

export { ChainOfThought, ChainOfThoughtStep, ChainOfThoughtResults }
