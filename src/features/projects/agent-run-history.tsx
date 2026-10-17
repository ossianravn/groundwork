import { Badge } from "@/kit/ui/badge"
import type { AgentRun, AgentWorkflow } from "@/demo/agent-runs"
import { runOutcome, runTime } from "./agent-run-outcome"

const duration = (run: AgentRun) => {
  if (!run.finishedAt) return undefined

  const seconds = Math.max(
    1,
    Math.round((run.finishedAt - run.startedAt) / 1000),
  )

  return seconds < 60 ? `${seconds} s` : `${Math.round(seconds / 60)} min`
}

/** The project's runs, newest first; each opens its run. */
export function AgentRunHistory({
  runs,
  labelOf,
  onOpen,
}: {
  runs: AgentRun[]
  labelOf: (workflow: AgentWorkflow) => string
  onOpen: (id: string) => void
}) {
  return (
    <section className="agent-history" aria-labelledby="agent-history-title">
      <h3 id="agent-history-title">Runs</h3>
      <ol>
        {runs.map((run) => (
          <li key={run.id}>
            <button
              type="button"
              id={`agent-run-${run.id}`}
              className="agent-history-row"
              onClick={() => onOpen(run.id)}
            >
              <span className="agent-history-name">
                {labelOf(run.workflow)}
              </span>
              <Badge variant="outline" data-status={run.status}>
                {runOutcome(run)}
              </Badge>
              <span className="agent-history-meta">
                {runTime(run.startedAt)}
                {duration(run) && ` · ${duration(run)}`}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}
