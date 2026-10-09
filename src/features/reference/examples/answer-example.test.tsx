import { renderToStaticMarkup } from "react-dom/server"
import { parsePartialJson } from "ai"
import { expect, it } from "vitest"
import { z } from "zod"
import { answerNodeList } from "@/kit/answer/answer-library"
import { AnswerRenderer } from "@/kit/answer/answer-renderer"
import { exampleAnswer, exampleLibrary } from "./answer-example-library"

// A partly written input, read as far as it goes.
const draft = z.object({ nodes: answerNodeList }).catch({ nodes: [] })

it("writes an answer its library accepts, and draws every prefix of it", async () => {
  expect(exampleLibrary.validate(exampleAnswer)).toEqual([])

  const json = JSON.stringify(exampleAnswer)

  for (let end = 1; end <= json.length; end += 29) {
    const { value } = await parsePartialJson(json.slice(0, end))

    expect(() =>
      renderToStaticMarkup(
        <AnswerRenderer
          nodes={draft.parse(value).nodes}
          library={exampleLibrary}
          streaming
        />,
      ),
    ).not.toThrow()
  }

  const finished = renderToStaticMarkup(
    <AnswerRenderer nodes={exampleAnswer.nodes} library={exampleLibrary} />,
  )

  expect(finished).toContain("Store screenshots")
  expect(finished).toContain("Plan the week")
})
