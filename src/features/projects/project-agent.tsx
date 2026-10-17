import { useRef, useState } from "react"
import { ArrowLeft, FileText, ListPlus } from "lucide-react"
import { Button } from "@/kit/ui/button"
import {
  isActiveRun,
  type AgentRun,
  type AgentWorkflow,
} from "@/demo/agent-runs"
import { plural } from "@/demo/assistant/answer-format"
import { formatDate, type Project } from "@/demo/model"
import { AgentCard, type AgentDescription } from "./agent-card"
import { AgentRunHistory } from "./agent-run-history"
import { runOutcome, runTime } from "./agent-run-outcome"
import { AgentRunView, type RunActions } from "./agent-run-view"

/** What the agents read, counted from the project's records now. */
export interface AgentContext {
  openTasks: number
  doneTasks: number
  doneThisWeek: number
  comments: number
  eventsThisWeek: number
}

const labels: Record<AgentWorkflow, string> = {
  "status-report": "Status report",
  "launch-plan": "Launch plan",
}

function agentsFor(
  project: Project,
  context: AgentContext,
): Record<AgentWorkflow, AgentDescription> {
  const total = context.openTasks + context.doneTasks
  const percent = total ? Math.round((context.doneTasks / total) * 100) : 0

  return {
    "status-report": {
      label: labels["status-report"],
      icon: FileText,
      promise: "Drafts this week's update from the work itself.",
      reads: `${plural(context.openTasks, "open task")} · ${plural(context.comments, "comment")} · ${plural(context.eventsThisWeek, "event")} this week`,
      produces: [
        `Progress: ${context.doneTasks} of ${total} tasks (${percent}%)`,
        `Done this week: ${plural(context.doneThisWeek, "task")}`,
        `Next: ${plural(context.openTasks, "open task")}, due ${formatDate(project.dueDate)}`,
      ],
      policy: "You review the report before it's posted to Comments.",
    },
    "launch-plan": {
      label: labels["launch-plan"],
      icon: ListPlus,
      promise: "Finds launch steps the task list doesn't cover yet.",
      reads: `${plural(total, "task")} and who has them · due ${formatDate(project.dueDate)}`,
      produces: [
        "The missing launch steps, as tasks",
        "A suggested owner for each, from who has room",
      ],
      policy: "You approve the tasks before they're added.",
    },
  }
}

const latest = "latest"

const announcement = (run?: AgentRun) =>
  run?.status === "waiting"
    ? `${run.title} needs your review.`
    : run?.status === "failed"
      ? `${run.title} needs attention.`
      : run?.status === "completed" || run?.status === "cancelled"
        ? `${run.title}: ${run.outcome ?? "finished"}`
        : ""

/**
 * The project's agents (design-system.md, agents): routine work that runs
 * in the background, step by step, and stops for the person's approval
 * before it changes anything. At rest the tab shows each agent and the
 * runs so far; a run that is open, or needs the person, takes the tab.
 */
export function ProjectAgent({
  project,
  runs,
  context,
  nameOf,
  actions,
  onStart,
  onShowResult,
}: {
  project: Project
  /** This project's runs, newest first. */
  runs: AgentRun[]
  context: AgentContext
  /** A member's name as the reader would say it ("you"). */
  nameOf: (memberId: string) => string
  actions: RunActions
  onStart: (workflow: AgentWorkflow) => void
  onShowResult: (run: AgentRun) => void
}) {
  // The run shown: one opened from history, the latest after a start here,
  // or none; a run that needs the person shows regardless.
  const [opened, setOpened] = useState<string>()

  // Scheduling is a demo flag: nothing runs on Fridays.
  const [scheduled, setScheduled] = useState<AgentWorkflow[]>([])
  const heading = useRef<HTMLHeadingElement>(null)
  const active = runs.find(isActiveRun)

  const run =
    (opened === latest ? runs[0] : runs.find((item) => item.id === opened)) ??
    active

  const closed = project.status === "completed"
  const agents = agentsFor(project, context)

  const unavailable = (workflow: AgentWorkflow) =>
    active
      ? "Finish or stop the current run first."
      : closed && workflow === "launch-plan"
        ? "Completed projects take no new tasks."
        : undefined

  const lastRun = (workflow: AgentWorkflow) => {
    const last = runs.find((item) => item.workflow === workflow)

    return last && `${runTime(last.startedAt)} · ${runOutcome(last)}`
  }

  const focusHeading = () =>
    requestAnimationFrame(() => heading.current?.focus())

  const status = (
    <p className="sr-only" role="status">
      {announcement(run)}
    </p>
  )

  if (run)
    return (
      <section className="project-agent" aria-label="Agent run">
        <AgentRunView
          key={run.id}
          run={run}
          startedBy={nameOf(run.startedBy)}
          actions={actions}
          headingRef={heading}
          onShowResult={onShowResult}
          aside={
            !isActiveRun(run) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOpened(undefined)
                  requestAnimationFrame(() =>
                    document.getElementById(`agent-run-${run.id}`)?.focus(),
                  )
                }}
              >
                <ArrowLeft aria-hidden="true" data-icon="inline-start" />
                All agents
              </Button>
            )
          }
        />
        {status}
      </section>
    )

  return (
    <section className="project-agent" aria-labelledby="project-agent-title">
      <h3 id="project-agent-title" className="sr-only">
        Agents
      </h3>
      <div className="agent-cards">
        {(["status-report", "launch-plan"] as const).map((workflow) => (
          <AgentCard
            key={workflow}
            agent={agents[workflow]}
            lastRun={lastRun(workflow)}
            unavailable={unavailable(workflow)}
            scheduled={scheduled.includes(workflow)}
            onScheduleChange={(on) =>
              setScheduled((current) =>
                on
                  ? [...current, workflow]
                  : current.filter((item) => item !== workflow),
              )
            }
            onStart={() => {
              onStart(workflow)
              setOpened(latest)
              focusHeading()
            }}
          />
        ))}
      </div>
      {runs.length > 0 && (
        <AgentRunHistory
          runs={runs}
          labelOf={(workflow) => labels[workflow]}
          onOpen={(id) => {
            setOpened(id)
            focusHeading()
          }}
        />
      )}
      {status}
    </section>
  )
}
