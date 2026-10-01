import * as React from "react"
import {
  Check,
  Circle,
  CircleAlert,
  CircleCheck,
  CircleDot,
  CircleSlash,
} from "lucide-react"
import { cn } from "cn"
import { Badge } from "@/kit/ui/badge"
import { Progress, ProgressLabel, ProgressValue } from "@/kit/ui/progress"
import { Spinner } from "@/kit/ui/spinner"

export type WorkflowRunStatus =
  "running" | "waiting" | "failed" | "completed" | "cancelled"

export type WorkflowStepStatus =
  "pending" | "running" | "waiting" | "done" | "failed" | "skipped"

const runBadges = {
  running: { label: "Running", variant: "secondary" },
  waiting: { label: "Needs you", variant: "default" },
  failed: { label: "Needs attention", variant: "destructive" },
  completed: { label: "Completed", variant: "secondary" },
  cancelled: { label: "Cancelled", variant: "outline" },
} as const

/** A run's state in words, with a spinner while it works. */
function WorkflowRunBadge({ status }: { status: WorkflowRunStatus }) {
  const { label, variant } = runBadges[status]

  return (
    <Badge variant={variant} data-status={status}>
      {status === "running" && (
        <Spinner role="presentation" aria-hidden="true" />
      )}
      {status === "completed" && <Check aria-hidden="true" />}
      {status === "failed" && <CircleAlert aria-hidden="true" />}
      {label}
    </Badge>
  )
}

/**
 * The head of a background run: its state and timing, title, what it is
 * doing or did, progress while it is unfinished, and the actions that fit
 * its state. Pair it with WorkflowSteps for the step-by-step account.
 */
function WorkflowRunSummary({
  status,
  title,
  meta,
  description,
  progress,
  current,
  actions,
  aside,
  titleAs: Title = "h3",
  titleRef,
  className,
}: {
  status: WorkflowRunStatus
  title: React.ReactNode
  /** Timing and who started it, such as "Finished in 14s". */
  meta?: React.ReactNode
  /** What the run is doing, needs or did. */
  description?: React.ReactNode
  progress: { done: number; total: number }
  /** The step under way, labelling the progress bar. */
  current?: string
  actions?: React.ReactNode
  /** Controls at the end of the state line, such as switching runs. */
  aside?: React.ReactNode
  titleAs?: "h2" | "h3"
  /** Makes the title focusable, for returning focus after a decision. */
  titleRef?: React.Ref<HTMLHeadingElement>
  className?: string
}) {
  const unfinished = status !== "completed" && status !== "cancelled"

  return (
    <header
      data-slot="workflow-run-summary"
      className={cn("grid min-w-0 gap-3", className)}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <WorkflowRunBadge status={status} />
        {meta && (
          <span className="text-sm text-muted-foreground tabular-nums">
            {meta}
          </span>
        )}
        {aside && (
          <div className="ms-auto flex flex-wrap items-center gap-2">
            {aside}
          </div>
        )}
      </div>
      <div className="grid gap-1">
        <Title
          ref={titleRef}
          tabIndex={titleRef ? -1 : undefined}
          className="text-(length:--text-section) font-semibold outline-none"
        >
          {title}
        </Title>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {unfinished && (
        <Progress
          value={progress.done}
          max={progress.total}
          getAriaValueText={() =>
            `${progress.done} of ${progress.total} steps done`
          }
        >
          <ProgressLabel className="min-w-0 truncate">
            {current ?? "Progress"}
          </ProgressLabel>
          <ProgressValue>
            {() => `${progress.done} of ${progress.total} steps`}
          </ProgressValue>
        </Progress>
      )}
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  )
}

const steps = {
  pending: {
    label: "Not started",
    icon: Circle,
    tone: "text-muted-foreground",
  },
  running: { label: "In progress", icon: null, tone: "text-brand" },
  waiting: { label: "Needs you", icon: CircleDot, tone: "text-brand" },
  done: { label: "Done", icon: CircleCheck, tone: "text-(--success)" },
  failed: { label: "Failed", icon: CircleAlert, tone: "text-destructive" },
  skipped: {
    label: "Skipped",
    icon: CircleSlash,
    tone: "text-muted-foreground",
  },
} satisfies Record<
  WorkflowStepStatus,
  { label: string; icon: typeof Circle | null; tone: string }
>

/** The run's steps in order, joined by a line. */
function WorkflowSteps({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="workflow-steps"
      className={cn("grid min-w-0", className)}
      {...props}
    />
  )
}

/**
 * One step: its state by icon and in words, what it found once done and
 * how long it took. The step the run is on is marked as current; children
 * hold what it needs from the person, such as a draft to approve or the
 * way past a failure.
 */
function WorkflowStep({
  status,
  label,
  detail,
  meta,
  children,
  className,
}: {
  status: WorkflowStepStatus
  label: string
  /** What the step found or did. */
  detail?: React.ReactNode
  /** How long it took, shown for finished steps. */
  meta?: string
  children?: React.ReactNode
  className?: string
}) {
  const { label: state, icon: Icon, tone } = steps[status]

  const current =
    status === "running" || status === "waiting" || status === "failed"

  // Done steps show their duration; the others that need saying show state.
  const aside = status === "done" ? meta : status === "pending" ? null : state

  return (
    <li
      data-slot="workflow-step"
      data-status={status}
      aria-current={current ? "step" : undefined}
      className={cn(
        "relative grid grid-cols-[1.25rem_minmax(0,1fr)_auto] gap-x-3 rounded-lg px-3 py-2.5 text-sm",
        // The line from this step's mark to the next one's.
        "not-last:before:absolute not-last:before:top-8.5 not-last:before:-bottom-1.5 not-last:before:left-[calc(1.375rem-0.5px)] not-last:before:w-px not-last:before:bg-border",
        current && "bg-brand/6",
        status === "failed" && "bg-destructive/6",
        className,
      )}
    >
      <span className="relative mt-px flex justify-center">
        {Icon ? (
          <Icon className={cn("size-4.5", tone)} aria-hidden="true" />
        ) : (
          <Spinner
            className={cn("size-4.5", tone)}
            role="presentation"
            aria-hidden="true"
          />
        )}
      </span>
      <span className="grid min-w-0 gap-0.5">
        <span
          className={cn(
            "font-medium",
            (status === "pending" || status === "skipped") &&
              "text-muted-foreground",
            status === "failed" && "text-destructive",
          )}
        >
          {label}
          <span className="sr-only">{`, ${state}`}</span>
        </span>
        {detail && <span className="text-muted-foreground">{detail}</span>}
      </span>
      {aside ? (
        <span
          className={cn(
            "pt-px text-xs text-muted-foreground tabular-nums",
            current && "font-medium",
            current && tone,
          )}
          // The state is spoken with the label; a duration is not.
          aria-hidden={status !== "done"}
        >
          {aside}
        </span>
      ) : (
        <span />
      )}
      {children && <div className="col-start-2 col-end-4 mt-3">{children}</div>}
    </li>
  )
}

export { WorkflowRunBadge, WorkflowRunSummary, WorkflowSteps, WorkflowStep }
