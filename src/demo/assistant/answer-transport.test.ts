import { expect, it } from "vitest"
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai"
import { matchIntent } from "./assistant-answers"
import { answered, prompt, run, send } from "./transport-test-support"

it("routes catch-up requests ahead of the topics they mention", () => {
  expect(matchIntent("Catch me up on the launch plan")).toBe("catchup")
  expect(matchIntent("Brief me on Mobile app")).toBe("catchup")
})

it("streams a catch-up as an answer built from components", async () => {
  const { message, types } = await send("Catch me up on Brand refresh")

  if (!message) throw new Error("No reply")

  const answer = message.parts.find((part) => part.type === "tool-showAnswer")

  expect(answer).toMatchObject({
    state: "output-available",
    input: { title: "Catch-up: Brand refresh" },
    output: { shown: true },
  })

  expect(
    answer?.type === "tool-showAnswer" &&
      answer.state === "output-available" &&
      answer.input.nodes.map((node) => node.type),
  ).toEqual(["Heading", "Text", "Figures", "Callout", "Section", "Section"])

  // The answer says it all: no text, then its sources and follow-ups.
  expect(types).not.toContain("text")
  expect(types).toContain("source-url")
  expect(types).toContain("data-suggestions")

  // A new step follows the call, so the chat doesn't send anything back.
  expect(
    lastAssistantMessageIsCompleteWithToolCalls({ messages: [message] }),
  ).toBe(false)
})

it("asks which project to catch up on, then answers for the one chosen", async () => {
  const user = prompt("Catch me up")
  const { message } = await run([user])

  if (!message) throw new Error("No reply")

  expect(
    message.parts.find((part) => part.type === "tool-chooseProject"),
  ).toMatchObject({ state: "input-available", input: { purpose: "catchup" } })

  const { message: after } = await run([user, answered(message, "mobile")])

  expect(
    after?.parts.find((part) => part.type === "tool-showAnswer"),
  ).toMatchObject({ input: { title: "Catch-up: Mobile app" } })
})
