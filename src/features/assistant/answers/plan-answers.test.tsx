import { expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { parsePartialJson } from "ai"
import { z } from "zod"
import { answerNodeList, type AnswerState } from "@/kit/answer/answer-library"
import { AnswerRenderer } from "@/kit/answer/answer-renderer"
import { landPlan } from "@/demo/assistant/land-answer"
import { context } from "@/demo/assistant/transport-test-support"
import { tandemAnswers } from "./tandem-answers"

const draft = z.object({ nodes: answerNodeList }).catch({ nodes: [] })

const website = context.projects.find((project) => project.id === "website")

const render = (nodes: z.output<typeof draft>["nodes"], state?: AnswerState) =>
  renderToStaticMarkup(
    <AnswerRenderer
      nodes={nodes}
      library={tandemAnswers}
      interactive
      state={state}
    />,
  )

it("builds plans that Tandem's library accepts, for every open project", () => {
  for (const project of context.projects.filter(
    (item) => item.status !== "completed",
  )) {
    const { answer } = landPlan(project, context)

    if (!answer) throw new Error(`No plan for ${project.name}`)

    expect(tandemAnswers.validate(answer), project.name).toEqual([])
  }
})

it("renders every prefix of a streaming plan", async () => {
  if (!website) throw new Error("No Website redesign fixture")

  const json = JSON.stringify(landPlan(website, context).answer)

  for (let end = 1; end <= json.length; end += 41) {
    const { value } = await parsePartialJson(json.slice(0, end))

    expect(() =>
      renderToStaticMarkup(
        <AnswerRenderer
          nodes={draft.parse(value).nodes}
          library={tandemAnswers}
          streaming
        />,
      ),
    ).not.toThrow()
  }
})

it("links the views to the plan the person keeps", () => {
  if (!website) throw new Error("No Website redesign fixture")

  const { nodes } = draft.parse(landPlan(website, context).answer)

  const proposed = render(nodes)

  expect(proposed).toContain("Give 6 unowned tasks to Ava (4) and Mia (2)")
  expect(proposed).toContain("12 tasks move")
  expect(proposed).toContain("lands 6 Oct")
  expect(proposed).toContain("Adjust the plan")

  // Every change removed: the plan is the project as assigned.
  const none = render(nodes, { plan: {} })

  expect(none).toContain("No changes: the plan keeps every task where it is")
  expect(none).toContain("done 13 Oct, late")
  expect(none).toContain("Not in the plan")
})
