import { expect, it } from "vitest"
import {
  acting,
  answerOf,
  decided,
  prompt,
  run,
} from "@/demo/assistant/transport-test-support"
import { workOutputs } from "./inspector-outputs"

it("lists answers and the plans applied from them, newest first", async () => {
  const question = prompt("Who is overloaded?")
  const { message } = await run([question])
  const answer = answerOf(message)

  if (!message || !answer) throw new Error("No answer")

  // Applying from the answer as proposed.
  const act = acting("Apply the moves", {
    answerId: answer.toolCallId,
    nodeId: "apply",
    values: {},
  })

  const { message: request } = await run([question, message, act])
  const asked = [question, message, act]
  const { message: done } = await run([...asked, decided(request, true)])

  if (!done) throw new Error("Not applied")

  const outputs = workOutputs([...asked, done], [])

  expect(outputs).toMatchObject([
    {
      kind: "tasks",
      title: "22 changes to Website redesign and Design system",
      detail: "Reassign 22: Ava 12, Mia 10",
      state: "applied",
      links: [
        { label: "Open Website redesign" },
        { label: "Open Design system" },
      ],
    },
    {
      kind: "answer",
      title: "Plan for the team",
      detail: "Noah and Leo are overloaded",
      messageId: message.id,
    },
  ])
  expect(outputs[1]?.state).toBeUndefined()
})
