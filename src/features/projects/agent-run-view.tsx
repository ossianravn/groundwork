import { useId, type ReactNode, type RefObject } from "react"
import { Button } from "@/kit/ui/button"
import { Textarea } from "@/kit/ui/textarea"
import {
  WorkflowRunSummary,
  WorkflowStep,
  WorkflowSteps,
} from "@/kit/ai/workflow-run"
import {
  currentStep,
  type AgentRun,
  type AgentRunStep,
} from "@/demo/agent-runs"
import { plainText } from "@/features/assistant/assistant-text"
import { plural } from "@/demo/assistant/answer-format"

export interface RunActions {
  approve: (id: string, report?: string) => void
  retry: (id: string) => void
  skip: (id: string) => void
  cancel: (id: string, outcome: string) => void
}

const seconds = (ms: number) =>
  ms < 10_000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms / 1000)}s`

function elapsed(ms: number) {
  const total = Math.round(ms / 1000)

  return total < 60
    ? `${total}s`
    : `${Math.floor(total / 60)} min ${total % 60}s`
}

const clock = (time: number) =>
  new Intl.DateTimeFormat("en-GB", { timeStyle: "short" }).format(time)

const nothingDone = (run: AgentRun) =>
  run.workflow === "status-report"
    ? "Nothing was posted."
    : "No tasks were added."

const summaries = {
  "status-report":
    "Reads the week's tasks, activity and comments, then drafts an update for you to review.",
  "launch-plan":
    "Compares the open tasks with a launch checklist and proposes what's missing for you to approve.",
}

function description(run: AgentRun) {
  if (run.status === "waiting")
    return run.workflow === "status-report"
      ? "Review the report below. Nothing is posted until you approve it."
      : "Review the tasks below. Nothing is added until you approve them."

  if (run.status === "failed")
    return "A step failed. Try it again, or continue without it."

  if (run.status === "running") return summaries[run.workflow]

  return run.outcome
}

/**
 * One run on the project page: the summary, then each step. The step that
 * needs the person holds the decision: the report to edit and post, the
 * tasks to add, or the way past a failure. Each decision removes its own
 * buttons, so focus returns to the run's heading.
 */
export function AgentRunView({
  run,
  startedBy,
  actions,
  headingRef,
  aside,
  onShowResult,
}: {
  run: AgentRun
  /** Who started the run, as the reader would say it ("you"). */
  startedBy: string
  actions: RunActions
  headingRef: RefObject<HTMLHeadingElement | null>
  /** The run picker and New run, at the end of the state line. */
  aside: ReactNode
  onShowResult: (run: AgentRun) => void
}) {
  const formId = useId()
  const step = run.steps[currentStep(run)]

  const after = (act: () => void) => () => {
    act()
    headingRef.current?.focus()
  }

  const finished = run.finishedAt
    ? `Finished in ${elapsed(run.finishedAt - run.startedAt)} · started ${clock(run.startedAt)}`
    : `Started ${clock(run.startedAt)} by ${startedBy}`

  const decision = (current: AgentRunStep) => {
    if (current.status === "failed")
      return (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={after(() => actions.retry(run.id))}>
            Try again
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={after(() => actions.skip(run.id))}
          >
            {current.skipLabel ?? "Skip this step"}
          </Button>
        </div>
      )

    if (current.status !== "waiting") return null

    const discard = (
      <Button
        size="sm"
        variant="ghost"
        onClick={after(() =>
          actions.cancel(run.id, `Discarded. ${nothingDone(run)}`),
        )}
      >
        Discard
      </Button>
    )

    if (run.tasks)
      return (
        <div className="grid gap-3">
          <ul className="agent-run-tasks">
            {run.tasks.map((task) => (
              <li key={task.title}>
                <span>{task.title}</span>
                <span>{task.assignee ?? "Unassigned"}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={after(() => actions.approve(run.id))}>
              Add {plural(run.tasks.length, "task")}
            </Button>
            {discard}
          </div>
        </div>
      )

    return (
      <form
        id={formId}
        className="grid gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          const report = new FormData(event.currentTarget).get("report")

          after(() => actions.approve(run.id, String(report)))()
        }}
      >
        <label className="grid gap-1.5">
          <span className="text-sm font-medium">Report</span>
          <Textarea
            name="report"
            required
            rows={10}
            defaultValue={plainText(run.report ?? "")}
            aria-describedby={`${formId}-hint`}
          />
          <span id={`${formId}-hint`} className="text-xs text-muted-foreground">
            Edit it if needed. It's posted to Comments under your name.
          </span>
        </label>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" type="submit">
            Post report
          </Button>
          {discard}
        </div>
      </form>
    )
  }

  const applied = run.steps.some(
    (item) => item.applies && item.status === "done",
  )

  return (
    <div className="agent-run">
      <WorkflowRunSummary
        status={run.status}
        title={run.title}
        titleRef={headingRef}
        aside={aside}
        meta={finished}
        description={description(run)}
        progress={{
          done: run.steps.filter(
            (item) => item.status === "done" || item.status === "skipped",
          ).length,
          total: run.steps.length,
        }}
        current={step?.label}
        actions={
          run.status === "running" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={after(() =>
                actions.cancel(run.id, `Stopped. ${nothingDone(run)}`),
              )}
            >
              Stop run
            </Button>
          ) : applied ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onShowResult(run)}
            >
              {run.workflow === "status-report"
                ? "Show in Comments"
                : "Show tasks"}
            </Button>
          ) : undefined
        }
      />
      <WorkflowSteps aria-label={`${run.title} steps`}>
        {run.steps.map((item) => (
          <WorkflowStep
            key={item.id}
            status={item.status}
            label={item.label}
            detail={
              item.status === "done"
                ? item.detail
                : item.status === "failed"
                  ? item.error
                  : undefined
            }
            // A gate's time is the person's, not the agent's.
            meta={
              item.startedAt && item.finishedAt && !item.gate
                ? seconds(item.finishedAt - item.startedAt)
                : undefined
            }
          >
            {item === step && decision(item)}
          </WorkflowStep>
        ))}
      </WorkflowSteps>
    </div>
  )
}
