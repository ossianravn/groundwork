import * as React from "react"
import {
  Check,
  ChevronDown,
  CircleAlert,
  CircleSlash,
  Clock,
  Wrench,
  type LucideIcon,
} from "lucide-react"
import { cn } from "cn"
import { Badge } from "@/kit/ui/badge"
import { CodeBlock } from "@/kit/ui/code-block"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/kit/ui/collapsible"
import { Spinner } from "@/kit/ui/spinner"

/**
 * JSON as a tool call carries it: parameters and results. Undefined covers
 * parameters that are still streaming in.
 */
export type ToolJson =
  | undefined
  | string
  | number
  | boolean
  | null
  | ToolJson[]
  | { [key: string]: ToolJson }

/** The AI SDK's tool part states. */
export type ToolState =
  | "input-streaming"
  | "input-available"
  | "approval-requested"
  | "approval-responded"
  | "output-available"
  | "output-error"
  | "output-denied"

interface StateDisplay {
  label: string
  icon: LucideIcon | "spinner"
  tone: "secondary" | "outline" | "destructive"
}

const states: Record<ToolState, StateDisplay> = {
  "input-streaming": { label: "Preparing", icon: "spinner", tone: "secondary" },
  "input-available": { label: "Running", icon: "spinner", tone: "secondary" },
  "approval-requested": {
    label: "Needs approval",
    icon: Clock,
    tone: "outline",
  },
  "approval-responded": { label: "Approved", icon: Check, tone: "secondary" },
  "output-available": { label: "Done", icon: Check, tone: "secondary" },
  "output-error": { label: "Failed", icon: CircleAlert, tone: "destructive" },
  "output-denied": { label: "Denied", icon: CircleSlash, tone: "outline" },
}

const stopped: StateDisplay = {
  label: "Stopped",
  icon: CircleSlash,
  tone: "outline",
}

function ToolStatus({
  state,
  interrupted = false,
}: {
  state: ToolState
  interrupted?: boolean
}) {
  const running = state === "input-streaming" || state === "input-available"

  const {
    label,
    icon: Icon,
    tone,
  } = interrupted && running ? stopped : states[state]

  return (
    <Badge variant={tone} className="shrink-0 gap-1">
      {Icon === "spinner" ? (
        // The badge's words carry the state; the spinner is decoration here.
        <Spinner className="size-3" role="presentation" aria-hidden="true" />
      ) : (
        <Icon className="size-3" aria-hidden="true" />
      )}
      {label}
    </Badge>
  )
}

/**
 * One tool call: a row naming the tool and its state that opens to show the
 * parameters and the result. Closed by default, since the reply usually
 * says what the call found; open it by default for failures worth reading.
 */
function Tool({
  className,
  ...props
}: React.ComponentProps<typeof Collapsible>) {
  return (
    <Collapsible
      data-slot="tool"
      className={cn(
        "min-w-0 rounded-lg border border-border bg-background",
        className,
      )}
      {...props}
    />
  )
}

function ToolHeader({
  title,
  state,
  interrupted,
  className,
}: {
  title: string
  state: ToolState
  /** The reply ended before the call finished, for example when stopped. */
  interrupted?: boolean
  className?: string
}) {
  return (
    <CollapsibleTrigger
      className={cn(
        "group/tool flex min-h-(--control-height) w-full items-center gap-2 rounded-lg px-3 text-start text-sm outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <Wrench
        className="size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 truncate font-medium">{title}</span>
      <ToolStatus state={state} interrupted={interrupted} />
      <ChevronDown
        className="size-4 shrink-0 text-muted-foreground transition-transform group-data-panel-open/tool:rotate-180"
        aria-hidden="true"
      />
    </CollapsibleTrigger>
  )
}

function ToolContent({
  className,
  ...props
}: React.ComponentProps<typeof CollapsibleContent>) {
  return (
    <CollapsibleContent
      data-slot="tool-content"
      className={cn("grid gap-3 border-t border-border p-3 text-sm", className)}
      {...props}
    />
  )
}

function ToolSection({
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

/** Indented JSON that keeps short arrays of values on one line. */
function formatJson(value: ToolJson) {
  return JSON.stringify(value ?? {}, null, 2).replace(
    /\[\s+([^[\]{}]*?)\s+\]/gu,
    (_, items: string) => `[${items.split(/,\s+/u).join(", ")}]`,
  )
}

/** The call's parameters, as JSON. */
function ToolInput({ input }: { input: ToolJson }) {
  return (
    <ToolSection label="Parameters">
      <CodeBlock code={formatJson(input)} language="json" />
    </ToolSection>
  )
}

/**
 * The call's result: pass a rendering as children, or it shows the output as
 * JSON. An error replaces the result.
 */
function ToolOutput({
  output,
  errorText,
  children,
}: {
  output?: ToolJson
  errorText?: string
  children?: React.ReactNode
}) {
  if (errorText)
    return (
      <ToolSection label="Error">
        <p className="text-destructive">{errorText}</p>
      </ToolSection>
    )

  if (output === undefined && !children) return null

  return (
    <ToolSection label="Result">
      {children ?? <CodeBlock code={formatJson(output)} language="json" />}
    </ToolSection>
  )
}

export { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput, ToolStatus }
