import type { AgentRun } from "@/demo/agent-runs"

/** What a run came to, in a word or two. */
export function runOutcome(run: AgentRun) {
  switch (run.status) {
    case "running":
      return "Running"
    case "waiting":
      return "Needs your review"
    case "failed":
      return "Failed"
    case "cancelled":
      return run.outcome?.startsWith("Discarded") ? "Discarded" : "Stopped"
    case "completed":
      return run.workflow === "status-report" ? "Posted" : "Tasks added"
  }
}

const time = new Intl.DateTimeFormat("en-GB", { timeStyle: "short" })

const day = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" })

/** When a run started: its time today, or its day and time before then. */
export function runTime(at: number, now = Date.now()) {
  const sameDay = new Date(at).toDateString() === new Date(now).toDateString()

  return `${sameDay ? "Today" : day.format(at)}, ${time.format(at)}`
}
