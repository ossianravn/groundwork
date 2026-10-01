import { useRef, useState } from "react"
import { ChevronDown, Sparkles } from "lucide-react"
import { Button } from "@/kit/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/kit/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"
import {
  isActiveRun,
  type AgentRun,
  type AgentWorkflow,
} from "@/demo/agent-runs"
import type { Project } from "@/demo/model"
import { AgentRunView, type RunActions } from "./agent-run-view"

const workflows: { id: AgentWorkflow; label: string; description: string }[] = [
  {
    id: "status-report",
    label: "Write a status report",
    description:
      "Reads the week's tasks, activity and comments and drafts an update. You review it before it's posted.",
  },
  {
    id: "launch-plan",
    label: "Plan the launch",
    description:
      "Finds launch steps the task list doesn't cover yet and proposes tasks. You approve them before they're added.",
  },
]

const announcement = (run?: AgentRun) =>
  run?.status === "waiting"
    ? `${run.title} needs your review.`
    : run?.status === "failed"
      ? `${run.title} needs attention.`
      : run?.status === "completed" || run?.status === "cancelled"
        ? `${run.title}: ${run.outcome ?? "finished"}`
        : ""

/**
 * The project's agent: routine work it runs in the background, step by
 * step, stopping for approval before it changes anything. Starting a run
 * shows it here; earlier runs stay available from the run picker.
 */
export function ProjectAgent({
  project,
  runs,
  nameOf,
  actions,
  onStart,
  onShowResult,
}: {
  project: Project
  /** This project's runs, newest first. */
  runs: AgentRun[]
  /** A member's name as the reader would say it ("you"). */
  nameOf: (memberId: string) => string
  actions: RunActions
  onStart: (workflow: AgentWorkflow) => void
  onShowResult: (run: AgentRun) => void
}) {
  const [selected, setSelected] = useState<string>()
  const heading = useRef<HTMLHeadingElement>(null)
  const run = runs.find((item) => item.id === selected) ?? runs[0]
  const busy = runs.some(isActiveRun)
  const closed = project.status === "completed"

  const unavailable = (workflow: AgentWorkflow) =>
    busy
      ? "Finish or stop the current run first."
      : closed && workflow === "launch-plan"
        ? "Completed projects take no new tasks."
        : undefined

  const start = (workflow: AgentWorkflow) => {
    onStart(workflow)
    setSelected(undefined)
    requestAnimationFrame(() => heading.current?.focus())
  }

  const status = (
    <p className="sr-only" role="status">
      {announcement(run)}
    </p>
  )

  if (!run)
    return (
      <section className="project-agent" aria-labelledby="project-agent-title">
        <div className="project-agent-intro">
          <h3 id="project-agent-title">Let the agent take routine work</h3>
          <p>
            It works in the background, so you can leave this page, and asks
            before it posts or adds anything.
          </p>
        </div>
        <ul className="project-agent-workflows">
          {workflows.map((workflow) => (
            <li key={workflow.id}>
              <div>
                <h4>{workflow.label}</h4>
                <p>{unavailable(workflow.id) ?? workflow.description}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={Boolean(unavailable(workflow.id))}
                aria-label={`Start: ${workflow.label}`}
                onClick={() => start(workflow.id)}
              >
                Start
              </Button>
            </li>
          ))}
        </ul>
        {status}
      </section>
    )

  return (
    <section className="project-agent" aria-label="Agent runs">
      <AgentRunView
        key={run.id}
        run={run}
        startedBy={nameOf(run.startedBy)}
        actions={actions}
        headingRef={heading}
        onShowResult={onShowResult}
        aside={
          <>
            {runs.length > 1 && (
              <Select
                items={runs.map((item) => ({
                  value: item.id,
                  label: runLabel(item),
                }))}
                value={run.id}
                onValueChange={(value) => {
                  if (value !== null) setSelected(value)
                }}
              >
                <SelectTrigger aria-label="Run" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {runs.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {runLabel(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="outline" size="sm" />}
                className="project-agent-new"
              >
                <Sparkles data-icon="inline-start" aria-hidden="true" />
                New run
                <ChevronDown data-icon="inline-end" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="project-agent-menu">
                {workflows.map((workflow) => (
                  <DropdownMenuItem
                    key={workflow.id}
                    disabled={Boolean(unavailable(workflow.id))}
                    onClick={() => start(workflow.id)}
                  >
                    <span className="grid gap-0.5">
                      <span className="font-medium">{workflow.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {unavailable(workflow.id) ?? workflow.description}
                      </span>
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />
      {status}
    </section>
  )
}

const runLabel = (run: AgentRun) =>
  `${run.title} · ${new Intl.DateTimeFormat("en-GB", { timeStyle: "short" }).format(run.startedAt)}`
