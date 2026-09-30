import * as React from "react"
import { Bot, Wrench } from "lucide-react"
import { cn } from "cn"
import { Badge } from "@/kit/ui/badge"

/**
 * An agent's configuration at a glance: who it is, the model it uses, its
 * instructions, the tools it may call and what it produces. It describes;
 * put the controls that change it beside it.
 */
function Agent({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="agent"
      className={cn(
        "grid min-w-0 gap-4 rounded-lg border border-border bg-card p-(--card-padding) text-sm",
        className,
      )}
      {...props}
    />
  )
}

function AgentHeader({
  name,
  model,
  description,
}: {
  name: string
  model?: string
  description?: string
}) {
  return (
    <header className="flex min-w-0 items-start gap-3">
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
        aria-hidden="true"
      >
        <Bot className="size-4.5" />
      </span>
      <div className="grid min-w-0 flex-1 gap-0.5">
        <h3 className="flex flex-wrap items-center gap-2 font-medium">
          {name}
          {model && <Badge variant="secondary">{model}</Badge>}
        </h3>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
    </header>
  )
}

/** A labelled part of the configuration: instructions, tools, output. */
function AgentSection({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <section className="grid min-w-0 gap-1.5" aria-label={label}>
      <h4 className="text-xs font-medium text-muted-foreground">{label}</h4>
      {children}
    </section>
  )
}

function AgentInstructions({ children }: { children: React.ReactNode }) {
  return (
    <AgentSection label="Instructions">
      <p className="rounded-md bg-muted/60 px-3 py-2 leading-relaxed whitespace-pre-line">
        {children}
      </p>
    </AgentSection>
  )
}

/** The tools it may call; each says whether it is on and what it needs. */
function AgentTools({ children }: { children: React.ReactNode }) {
  return (
    <AgentSection label="Tools">
      <ul className="grid gap-2">{children}</ul>
    </AgentSection>
  )
}

function AgentTool({
  name,
  description,
  enabled = true,
  note,
}: {
  name: string
  description: string
  enabled?: boolean
  /** Such as "Asks first". */
  note?: string
}) {
  return (
    <li className="flex min-w-0 items-start gap-2.5">
      <Wrench
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className="flex flex-wrap items-center gap-1.5">
          <code className="font-mono text-[0.8125rem]">{name}</code>
          {note && <Badge variant="outline">{note}</Badge>}
          {!enabled && <Badge variant="secondary">Off</Badge>}
        </span>
        <span className="text-muted-foreground">{description}</span>
      </span>
    </li>
  )
}

export {
  Agent,
  AgentHeader,
  AgentSection,
  AgentInstructions,
  AgentTools,
  AgentTool,
}
