import { useEffect, useEffectEvent, useState } from "react"
import {
  advanceRun,
  approveRun,
  cancelRun,
  retryStep,
  skipStep,
  type AgentRun,
} from "./agent-runs"

/**
 * Agent runs on projects, kept in memory like the rest of the demo. A run
 * moves on by itself, step by step, wherever the person is in the app; it
 * stops at a gate until they approve and makes its change (`apply`) only
 * at its applying step. Reset clears them.
 */
export function useAgentRuns(apply: (run: AgentRun) => void) {
  const [runs, setRuns] = useState<AgentRun[]>([])
  const onApply = useEffectEvent(apply)

  const replace = (id: string, change: (run: AgentRun) => AgentRun) =>
    setRuns((current) =>
      current.map((run) => (run.id === id ? change(run) : run)),
    )

  // Each running step finishes after its duration. Any change to the runs
  // reschedules from the steps' start times, so no timer outlives its step.
  useEffect(() => {
    const timers = runs.flatMap((run) => {
      const step = run.steps.find((item) => item.status === "running")

      if (!step?.startedAt) return []

      const wait = step.startedAt + step.duration - Date.now()

      return [
        window.setTimeout(
          () => {
            const next = advanceRun(run, Date.now())

            replace(run.id, () => next.run)

            if (next.applies) onApply(next.run)
          },
          Math.max(0, wait),
        ),
      ]
    })

    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [runs])

  return {
    runs,
    start(run: AgentRun) {
      setRuns((current) => [run, ...current])
    },
    approve(id: string, report?: string) {
      replace(id, (run) => approveRun(run, Date.now(), report))
    },
    retry(id: string) {
      replace(id, (run) => retryStep(run, Date.now()))
    },
    skip(id: string) {
      replace(id, (run) => skipStep(run, Date.now()))
    },
    cancel(id: string, outcome: string) {
      replace(id, (run) => cancelRun(run, Date.now(), outcome))
    },
    reset() {
      setRuns([])
    },
  }
}
