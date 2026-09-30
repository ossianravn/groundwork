import { expect, it } from "vitest"
import { initialProjects } from "../project-fixtures"
import { initialActivity } from "../activity-fixtures"
import { initialTasks } from "../project-tasks"
import workspace from "../data/workspace.json"
import { assistantReply } from "./assistant-answers"

const context = {
  projects: initialProjects,
  tasks: initialTasks,
  activity: initialActivity,
  people: workspace.members,
  referenceDate: workspace.referenceDate,
}

it("drafts a status update from the project's week and open tasks", () => {
  const reply = assistantReply("Draft a status update for Mobile app", context)

  const open = initialTasks.find(
    (task) => task.projectId === "mobile" && !task.done,
  )

  expect(reply.artifact).toMatchObject({
    projectId: "mobile",
    url: "/app/demo/projects/mobile",
    complete: true,
  })
  expect(reply.artifact?.content).toContain("### This week")
  expect(reply.artifact?.content).toContain(`- ${open?.title}`)
})

it("asks which project an update is for when none is named", () => {
  const reply = assistantReply("Write a status update", context)

  expect(reply.question?.purpose).toBe("status")
  expect(reply.followUps).toEqual([])
})

it("answers about a help guide named in the question, citing it", () => {
  const reply = assistantReply(
    "Summarise the help guide “Create and edit a project”",
    context,
  )

  expect(reply.text).toContain("/help/")
  expect(reply.sources).toHaveLength(1)
})

it("explains instead of answering when the tool it needs is off", () => {
  const tools = { searchProjects: false, createTasks: true, draftUpdates: true }

  const reply = assistantReply("Which projects are at risk?", context, {
    tools,
  })

  expect(reply.text).toContain("/app/demo/settings/assistant")
  expect(reply.tool).toBeUndefined()
})
