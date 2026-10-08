import { beforeEach, expect, it } from "vitest"
import { matchIntent } from "./assistant-answers"
import { teamPlanProps } from "./plan-schemas"
import {
  acting,
  answerOf,
  applied,
  decided,
  prompt,
  run,
} from "./transport-test-support"

beforeEach(() => {
  applied.length = 0
})

const question = prompt("Who is overloaded?")

async function balanced() {
  const { message } = await run([question])
  const answer = answerOf(message)

  if (!message || !answer) throw new Error("No answer")

  return { message, answer }
}

it("routes questions about overload to the team's balance", () => {
  expect(matchIntent("Who is overloaded?")).toBe("balance")
  expect(matchIntent("Balance the team's workload")).toBe("balance")
  expect(matchIntent("Can we land Design system by 16 October?")).toBe("land")
  expect(matchIntent("Which projects are at risk?")).toBe("risk")
})

it("answers with the team's load, each project's date and the moves", async () => {
  const { answer } = await balanced()

  expect(answer.input.nodes.map((node) => node.type)).toEqual([
    "Heading",
    "Text",
    "TeamPlan",
  ])
  expect(answer.input.nodes[0]?.props).toEqual({
    text: "Noah and Leo are overloaded",
    detail: "22 moves to Ava and Mia land every project on time",
  })
  expect(answer.input.nodes[2]?.children?.map((child) => child.type)).toEqual([
    "PlanLoad",
    "PlanProjects",
    "PlanChanges",
    "PlanApply",
  ])
})

it("applies the moves the person kept, across projects, after approval", async () => {
  const { message, answer } = await balanced()

  // The person kept Noah's Design system tasks with Noah.
  const { changes } = teamPlanProps.parse(answer.input.nodes[2]?.props)

  const moves = Object.fromEntries(
    changes
      .filter((change) => change.id !== "design-system-noah-move")
      .flatMap((change) => change.moves.map((move) => [move.taskId, move.to])),
  )

  const act = acting("Apply the moves", {
    answerId: answer.toolCallId,
    nodeId: "apply",
    values: { moves },
  })

  const { message: request } = await run([question, message, act])

  expect(
    request?.parts.find((part) => part.type === "tool-applyPlan"),
  ).toMatchObject({
    state: "approval-requested",
    input: {
      projects: [
        { id: "website", name: "Website redesign" },
        { id: "design-system", name: "Design system" },
      ],
    },
  })
  expect(applied).toEqual([])

  const { message: done } = await run([
    question,
    message,
    act,
    decided(request, true),
  ])

  expect(applied[0]?.moves).toHaveLength(6)
  expect(
    done?.parts.find((part) => part.type === "tool-applyPlan"),
  ).toMatchObject({
    state: "output-available",
    output: {
      reassigned: 6,
      projects: [{ id: "website" }, { id: "design-system" }],
    },
  })
  expect(
    done?.parts.filter((part) => part.type === "text").at(-1),
  ).toMatchObject({
    text: expect.stringMatching(
      /^Done: I reassigned 6 tasks in \[Website redesign\]\(.+\) and \[Design system\]\(.+\)\.$/u,
    ),
  })
})
