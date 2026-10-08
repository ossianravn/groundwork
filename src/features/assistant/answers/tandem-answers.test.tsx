import { expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { parsePartialJson } from "ai"
import { z } from "zod"
import { answerNodeList } from "@/kit/answer/answer-library"
import { AnswerRenderer } from "@/kit/answer/answer-renderer"
import { catchUp } from "@/demo/assistant/catchup-answer"
import { context } from "@/demo/assistant/transport-test-support"
import { tandemAnswers } from "./tandem-answers"

// A streamed prefix parses to whatever nodes have arrived, or none.
const draft = z.object({ nodes: answerNodeList }).catch({ nodes: [] })

const brand = context.projects.find((project) => project.id === "brand")

it("builds catch-ups that Tandem's library accepts, for every project", () => {
  for (const project of context.projects) {
    const { answer } = catchUp(project, context)

    if (!answer) throw new Error(`No answer for ${project.name}`)

    expect(tandemAnswers.validate(answer), project.name).toEqual([])
  }
})

it("renders every prefix of a streaming catch-up as the chat would", async () => {
  if (!brand) throw new Error("No Brand refresh fixture")

  const json = JSON.stringify(catchUp(brand, context).answer)

  // The client re-parses the tool input after each delta; any prefix must
  // render without throwing (server rendering has no error boundaries).
  for (let end = 1; end <= json.length; end += 11) {
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

  const finished = renderToStaticMarkup(
    <AnswerRenderer
      nodes={draft.parse(JSON.parse(json)).nodes}
      library={tandemAnswers}
    />,
  )

  expect(finished).toContain("Brand refresh is running 4 days late")
  expect(finished).toContain("2 open tasks have no owner")
  expect(finished).toContain("Primary palette.svg")
  expect(finished).not.toContain('data-slot="skeleton"')
})

it("reads an answer as text for copying and announcing", () => {
  if (!brand) throw new Error("No Brand refresh fixture")

  const text = tandemAnswers.text(catchUp(brand, context).answer?.nodes ?? [])

  expect(text).toMatch(/^Brand refresh is running 4 days late/u)
  expect(text).toContain("Done: 24 of 32")
  expect(text).toContain("### Files")
})
