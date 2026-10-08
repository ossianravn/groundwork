import { expect, it } from "vitest"
import { initialProjects } from "./project-fixtures"
import { initialActivity } from "./activity-fixtures"
import { initialTasks } from "./project-tasks"
import { initialFiles } from "./project-files"
import workspace from "./data/workspace.json"
import { startRun } from "./agent-run-plans"
import {
  advanceRun,
  approveRun,
  cancelRun,
  retryStep,
  skipStep,
  type AgentRun,
} from "./agent-runs"

const context = {
  projects: initialProjects,
  tasks: initialTasks,
  activity: initialActivity,
  comments: [],
  people: workspace.members,
  files: initialFiles,
  referenceDate: workspace.referenceDate,
  currentUserId: workspace.currentUserId,
}

const project = (id: string) => {
  const found = initialProjects.find((item) => item.id === id)

  if (!found) throw new Error(`No project ${id}`)

  return found
}

const states = (run: AgentRun) => run.steps.map((step) => step.status).join(" ")

/** Advances until the run stops running, collecting whether it applied. */
function settle(run: AgentRun) {
  let current = run
  let applied = false

  while (current.status === "running") {
    const next = advanceRun(current, 0)

    current = next.run
    applied ||= next.applies
  }

  return { run: current, applied }
}

it("stops at the review and applies only after approval", () => {
  const run = startRun("status-report", project("brand"), context, 0)
  const waiting = settle(run)

  expect(waiting.run.status).toBe("waiting")
  expect(waiting.applied).toBe(false)
  expect(states(waiting.run)).toBe("done done done done waiting pending")
  expect(waiting.run.report).toContain("Brand refresh")

  const approved = settle(approveRun(waiting.run, 0, "Edited report"))

  expect(approved.applied).toBe(true)
  expect(approved.run).toMatchObject({
    status: "completed",
    report: "Edited report",
    outcome: "Posted to Comments",
  })
})

it("fails once, then retries or skips the failing step", () => {
  const run = startRun("status-report", project("brand"), context, 0, true)
  const failed = settle(run).run

  expect(failed.status).toBe("failed")
  expect(states(failed)).toBe("done done failed pending pending pending")

  expect(settle(retryStep(failed, 0)).run.status).toBe("waiting")
  expect(states(settle(skipStep(failed, 0)).run)).toBe(
    "done done skipped done waiting pending",
  )
})

it("proposes only the launch steps the project lacks", () => {
  const run = settle(startRun("launch-plan", project("mobile"), context, 0)).run

  expect(run.tasks?.map((task) => task.title)).toContain(
    "Confirm the launch date and scope",
  )

  const covered = {
    ...context,
    tasks: [
      ...context.tasks,
      ...(run.tasks ?? []).map((task, index) => ({
        ...task,
        id: `covered-${index}`,
        projectId: "mobile",
        done: false,
        createdAt: context.referenceDate,
      })),
    ],
  }

  const complete = settle(
    startRun("launch-plan", project("mobile"), covered, 0),
  )

  expect(complete.applied).toBe(false)
  expect(complete.run).toMatchObject({
    status: "completed",
    outcome: "Every launch step is already a task",
  })
})

it("skips the rest when a run is stopped or discarded", () => {
  const run = startRun("launch-plan", project("mobile"), context, 0)
  const stopped = cancelRun(run, 5, "Stopped. No tasks were added.")

  expect(stopped).toMatchObject({ status: "cancelled", finishedAt: 5 })
  expect(states(stopped)).toBe(
    "skipped skipped skipped skipped skipped skipped",
  )
})
