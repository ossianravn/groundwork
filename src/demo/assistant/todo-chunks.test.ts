import { expect, it } from "vitest"
import { replyChunks } from "./assistant-chunks"
import type { AssistantReply } from "./assistant-types"

const pace = { firstToken: 0, chunk: 0, work: 0 }

const reply: AssistantReply = {
  todo: {
    title: "Find the projects at risk",
    tasks: [
      { label: "Understand the question", after: "reasoning" },
      { label: "Search the open projects", after: "tool" },
      { label: "Compare due dates with open work", after: "text" },
    ],
  },
  reasoning: "Schedule risk needs due dates and open work.",
  tool: {
    name: "searchProjects",
    input: { status: ["in-progress"], fields: ["dueDate"] },
    output: [],
  },
  text: "One project needs attention.",
  followUps: [],
}

/** The working plan's statuses each time it is sent. */
function progress(fail: boolean) {
  return replyChunks(reply, fail, pace).flatMap(({ chunk }) =>
    chunk.type === "data-todo"
      ? [chunk.data.tasks.map((task) => task.status).join(" ")]
      : [],
  )
}

it("moves the working plan along as each stage of the reply streams", () => {
  expect(progress(false)).toEqual([
    "doing todo todo",
    "done doing todo",
    "done done doing",
    "done done done",
  ])
})

it("marks the task in progress blocked when the reply fails", () => {
  expect(progress(true).at(-1)).toBe("done done blocked")
})
