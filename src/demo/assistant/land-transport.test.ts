import { beforeEach, expect, it } from "vitest"
import type { AnswerState } from "@/kit/answer/answer-library"
import type { AnswerActionData, AssistantMessage } from "./assistant-types"
import { projectPlanProps } from "./plan-schemas"
import { applied, prompt, run, send } from "./transport-test-support"

beforeEach(() => {
  applied.length = 0
})

const question = prompt("Can we land Website redesign by 8 October?")

const answerOf = (message: AssistantMessage | undefined) => {
  const part = message?.parts.find((item) => item.type === "tool-showAnswer")

  return part?.type === "tool-showAnswer" && part.state === "output-available"
    ? { toolCallId: part.toolCallId, input: part.input }
    : undefined
}

const acting = (text: string, data: AnswerActionData): AssistantMessage => ({
  id: text,
  role: "user",
  parts: [
    { type: "text", text },
    { type: "data-action", data },
  ],
})

async function planned() {
  const { message } = await run([question])
  const answer = answerOf(message)

  if (!message || !answer) throw new Error("No plan")

  return { message, answer }
}

/** The reply asking to apply a plan, with the person's decision on it. */
function decided(
  request: AssistantMessage | undefined,
  approved: boolean,
): AssistantMessage {
  const call = request?.parts.find((part) => part.type === "tool-applyPlan")

  if (!request || call?.type !== "tool-applyPlan" || !("approval" in call))
    throw new Error("No approval")

  return {
    ...request,
    parts: request.parts.map((part) =>
      part.type === "tool-applyPlan" && part.state === "approval-requested"
        ? {
            ...part,
            state: "approval-responded",
            approval: { id: part.approval.id, approved },
          }
        : part,
    ),
  }
}

it("plans a late project as an answer with a linked plan and a form", async () => {
  const { answer } = await planned()

  expect(answer.input.nodes.map((node) => node.type)).toEqual([
    "Heading",
    "Text",
    "ProjectPlan",
    "Form",
  ])
  expect(answer.input.nodes[0]?.props).toMatchObject({
    text: "Website redesign can land 6 Oct, 2 days early",
  })
  expect(answer.input.nodes[2]?.children?.map((child) => child.type)).toEqual([
    "PlanProjection",
    "PlanLoad",
    "PlanChanges",
    "PlanApply",
  ])
})

it("plans again with the choices sent from the form", async () => {
  const { message, answer } = await planned()

  const { message: again } = await run([
    question,
    message,
    acting("Update the plan: Hit 8 Oct; Who can help: Mia Davis", {
      answerId: answer.toolCallId,
      nodeId: "adjust",
      values: { priority: "date", helpers: ["mia"] },
    }),
  ])

  const plan = answerOf(again)?.input.nodes.find(
    (node) => node.type === "ProjectPlan",
  )

  expect(JSON.stringify(plan?.props)).toContain("Defer")
})

it("applies the plan as the person left it, after approval", async () => {
  const { message, answer } = await planned()

  // The person kept Leo's tasks with Leo: only the other moves remain.
  const { changes } = projectPlanProps.parse(answer.input.nodes[2]?.props)

  const edits: AnswerState = {
    plan: Object.fromEntries(
      changes
        .filter((change) => change.id !== "leo-move")
        .flatMap((change) =>
          change.moves.map((move) => [move.taskId, move.to]),
        ),
    ),
  }

  const ask = prompt("Apply the plan")

  const { message: request } = await run(
    [question, message, ask],
    "normal",
    undefined,
    { [answer.toolCallId]: edits },
  )

  const call = request?.parts.find((part) => part.type === "tool-applyPlan")

  expect(call).toMatchObject({ state: "approval-requested" })
  expect(call?.type === "tool-applyPlan" && call.input?.moves?.length).toBe(9)
  expect(applied).toEqual([])

  const { message: declined } = await run([
    question,
    message,
    ask,
    decided(request, false),
  ])

  expect(applied).toEqual([])
  expect(
    declined?.parts.find((part) => part.type === "tool-applyPlan"),
  ).toMatchObject({ state: "output-denied" })

  const { message: done } = await run([
    question,
    message,
    ask,
    decided(request, true),
  ])

  expect(applied).toHaveLength(1)
  expect(applied[0]?.moves).toHaveLength(9)
  expect(
    done?.parts.find((part) => part.type === "tool-applyPlan"),
  ).toMatchObject({ state: "output-available", output: { reassigned: 9 } })
})

it("posts a plan that only defers work as a comment, moving nothing", async () => {
  const { message, answer } = await planned()

  // Nobody can help, and the date comes first: only deferrals remain.
  const adjust = acting("Update the plan: Hit 8 Oct; Who can help: none", {
    answerId: answer.toolCallId,
    nodeId: "adjust",
    values: { priority: "date", helpers: [] },
  })

  const { message: again } = await run([question, message, adjust])

  if (!again) throw new Error("No new plan")

  const asked = [question, message, adjust, again, prompt("Apply the plan")]
  const { message: request } = await run(asked)
  const { message: done } = await run([...asked, decided(request, true)])

  expect(applied).toHaveLength(1)
  expect(applied[0]?.moves).toEqual([])
  expect(applied[0]?.deferred.length).toBeGreaterThan(0)
  // The outcome follows the request in the same message.
  const said = done?.parts.filter((part) => part.type === "text").at(-1)

  expect(said).toMatchObject({
    text: expect.stringMatching(/^Done: I posted the \d+ deferred tasks to /u),
  })
})

it("asks which project to plan when none is named", async () => {
  const { message } = await send("Can we land it in time?")

  expect(
    message?.parts.find((part) => part.type === "tool-chooseProject"),
  ).toMatchObject({ input: { purpose: "land" } })
})
