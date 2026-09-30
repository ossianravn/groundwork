import * as React from "react"
import { ListTodo } from "lucide-react"
import { cn } from "cn"
import { Shimmer } from "@/kit/ui/shimmer"

/**
 * What the assistant proposes to do, before it does it: a titled card with
 * numbered steps. The decision to go ahead belongs to a Confirmation below
 * it, so the plan itself holds no actions.
 */
function Plan({
  title,
  description,
  streaming = false,
  children,
  className,
}: {
  title: string
  description?: React.ReactNode
  /** The plan is still arriving. */
  streaming?: boolean
  /** PlanStep items. */
  children: React.ReactNode
  className?: string
}) {
  const id = React.useId()

  return (
    <section
      data-slot="plan"
      aria-labelledby={id}
      aria-busy={streaming || undefined}
      className={cn(
        "grid min-w-0 gap-3 rounded-lg border border-border bg-background p-(--item-padding) ps-3 text-sm",
        className,
      )}
    >
      <header className="grid gap-1">
        <h3 id={id} className="flex items-center gap-2 font-medium">
          <ListTodo
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          {streaming ? <Shimmer>{title}</Shimmer> : title}
        </h3>
        {description && <p className="text-muted-foreground">{description}</p>}
      </header>
      <ol className="grid gap-2 [counter-reset:plan]">{children}</ol>
    </section>
  )
}

function PlanStep({
  children,
  detail,
}: {
  children: React.ReactNode
  /** Secondary information, such as who the step is for. */
  detail?: React.ReactNode
}) {
  return (
    <li
      data-slot="plan-step"
      className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2 [counter-increment:plan] before:text-end before:text-muted-foreground before:tabular-nums before:content-[counter(plan)'.']"
    >
      <span className="min-w-0">
        {children}
        {detail && <span className="text-muted-foreground"> · {detail}</span>}
      </span>
    </li>
  )
}

export { Plan, PlanStep }
