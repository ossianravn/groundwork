import type { NewTask } from "./project-tasks"

/** The routine project work the agent can run on its own. */
export type AgentWorkflow = "status-report" | "launch-plan"

export type AgentRunStatus =
  "running" | "waiting" | "failed" | "completed" | "cancelled"

export type AgentStepStatus =
  "pending" | "running" | "waiting" | "done" | "failed" | "skipped"

export interface AgentRunStep {
  id: string
  label: string
  status: AgentStepStatus
  /** What the step found or did, shown once it is done. */
  detail?: string
  /** How long the step takes in the demo, in milliseconds. */
  duration: number
  startedAt?: number
  finishedAt?: number
  /** The step waits for the person to approve before the run goes on. */
  gate?: boolean
  /** The step makes the run's change: posts the report or adds the tasks. */
  applies?: boolean
  /** Fails the first time it runs (the run-failure scenario). */
  fails?: boolean
  /** Why it failed, and what skipping it means. */
  error?: string
  skipLabel?: string
}

export interface AgentRun {
  id: string
  projectId: string
  workflow: AgentWorkflow
  title: string
  startedBy: string
  startedAt: number
  finishedAt?: number
  status: AgentRunStatus
  steps: AgentRunStep[]
  /** The report to post (status report). */
  report?: string
  /** The tasks to add (launch plan). */
  tasks?: (NewTask & { assignee: string | null })[]
  /** What the run changed or why it ended, once it has. */
  outcome?: string
}

const update = (
  run: AgentRun,
  index: number,
  step: Partial<AgentRunStep>,
): AgentRunStep[] =>
  run.steps.map((item, at) => (at === index ? { ...item, ...step } : item))

/** The step the run is on: running, waiting or failed. */
export const currentStep = (run: AgentRun) =>
  run.steps.findIndex(
    (step) =>
      step.status === "running" ||
      step.status === "waiting" ||
      step.status === "failed",
  )

/** Starts the step at index, or finishes the run when none is left. */
function begin(
  run: AgentRun,
  steps: AgentRunStep[],
  index: number,
  now: number,
): AgentRun {
  const step = steps[index]

  // The last step's result says what the run did.
  if (!step)
    return {
      ...run,
      steps,
      status: "completed",
      finishedAt: now,
      outcome: steps.at(-1)?.detail,
    }

  const status = step.gate ? ("waiting" as const) : ("running" as const)

  return {
    ...run,
    status,
    steps: steps.map((item, at) =>
      at === index ? { ...item, status, startedAt: now } : item,
    ),
  }
}

/**
 * Finishes the running step. A step set to fail fails once instead; the
 * run then needs the person to retry or skip it. The applying step returns
 * the run's change for the caller to make.
 */
export function advanceRun(run: AgentRun, now: number) {
  const index = run.steps.findIndex((step) => step.status === "running")
  const step = run.steps[index]

  if (!step) return { run, applies: false }

  if (step.fails)
    return {
      run: {
        ...run,
        status: "failed" as const,
        steps: update(run, index, {
          status: "failed",
          fails: false,
          finishedAt: now,
        }),
      },
      applies: false,
    }

  const steps = update(run, index, { status: "done", finishedAt: now })

  return {
    run: begin(run, steps, index + 1, now),
    applies: Boolean(step.applies),
  }
}

/** Approves the waiting step, with the report as the person left it. */
export function approveRun(run: AgentRun, now: number, report?: string) {
  const index = currentStep(run)
  const steps = update(run, index, { status: "done", finishedAt: now })
  const approved = report === undefined ? run : { ...run, report }

  return begin(approved, steps, index + 1, now)
}

/** Runs the failed step again. */
export function retryStep(run: AgentRun, now: number): AgentRun {
  const index = currentStep(run)

  return {
    ...run,
    status: "running",
    steps: update(run, index, {
      status: "running",
      startedAt: now,
      finishedAt: undefined,
    }),
  }
}

/** Skips the failed step and goes on without what it would have read. */
export function skipStep(run: AgentRun, now: number) {
  const index = currentStep(run)
  const steps = update(run, index, { status: "skipped", finishedAt: now })

  return begin(run, steps, index + 1, now)
}

/** Stops the run: the current step and the rest are skipped. */
export function cancelRun(run: AgentRun, now: number, outcome: string) {
  const from = currentStep(run)

  return {
    ...run,
    status: "cancelled" as const,
    finishedAt: now,
    outcome,
    steps: run.steps.map((step, at) =>
      from >= 0 && at >= from
        ? { ...step, status: "skipped" as const, finishedAt: now }
        : step,
    ),
  }
}

/** A run that is still going or waiting on the person. */
export const isActiveRun = (run: AgentRun) =>
  run.status === "running" ||
  run.status === "waiting" ||
  run.status === "failed"
