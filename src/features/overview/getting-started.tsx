import type { ReactNode } from "react"
import { CircleCheck, Circle, X } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Progress, ProgressLabel, ProgressValue } from "@/kit/ui/progress"

export interface GettingStartedStep {
  id: string
  label: string
  description: string
  done: boolean
  /** A link to where the step happens. */
  action: ReactNode
}

// First steps for a new workspace (AUTH-09). Steps tick themselves off from
// what exists in the workspace, so there is nothing to mark by hand.
export function GettingStarted({
  steps,
  onDismiss,
}: {
  steps: GettingStartedStep[]
  onDismiss: () => void
}) {
  const done = steps.filter((step) => step.done).length
  const complete = done === steps.length

  return (
    <section
      className="getting-started"
      aria-labelledby="getting-started-title"
    >
      <header className="getting-started-heading">
        <div>
          <h2 id="getting-started-title">
            {complete ? "Your workspace is set up" : "Get started"}
          </h2>
          <p>
            {complete
              ? "Every first step is done. You can hide this list."
              : "A few first steps to make the workspace useful."}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          <X aria-hidden="true" data-icon="inline-start" />
          Hide
        </Button>
      </header>
      <Progress value={Math.round((done / steps.length) * 100)}>
        <ProgressLabel className="sr-only">Getting started</ProgressLabel>
        <ProgressValue>{() => `${done} of ${steps.length} done`}</ProgressValue>
      </Progress>
      <ol className="getting-started-steps">
        {steps.map((step) => (
          <li key={step.id} data-done={step.done || undefined}>
            {step.done ? (
              <CircleCheck
                aria-hidden="true"
                className="getting-started-icon"
              />
            ) : (
              <Circle aria-hidden="true" className="getting-started-icon" />
            )}
            <div className="getting-started-text">
              <p className="getting-started-label">
                {step.label}
                <span className="sr-only">
                  {step.done ? " (done)" : " (to do)"}
                </span>
              </p>
              <p className="getting-started-description">{step.description}</p>
            </div>
            {!step.done && step.action}
          </li>
        ))}
      </ol>
    </section>
  )
}
