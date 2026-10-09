import {
  parseJsonEventStream,
  readUIMessageStream,
  uiMessageChunkSchema,
  type UIMessage,
  type UIMessageChunk,
} from "ai"
import { MockLanguageModelV4, convertArrayToReadableStream } from "ai/test"
import { expect, it } from "vitest"
import { z } from "zod"
import { answerNodeList } from "@/kit/answer/answer-library"
import { exampleAnswer } from "./answer-example-library"
import { answerRoute } from "./answer-route"

// A tool part's input, read as far as it goes.
const draft = z.object({ nodes: answerNodeList }).catch({ nodes: [] })

// The reference's route against the AI SDK's own mock model: the model
// streams a showAnswer call, and the client reads it as useChat would.
it("streams a model's answer to the client as it is written", async () => {
  const input = JSON.stringify(exampleAnswer)
  const deltas = input.match(/.{1,120}/gsu) ?? []

  const model = new MockLanguageModelV4({
    doStream: {
      stream: convertArrayToReadableStream([
        { type: "stream-start", warnings: [] },
        { type: "tool-input-start", id: "call-1", toolName: "showAnswer" },
        ...deltas.map((delta) => ({
          type: "tool-input-delta" as const,
          id: "call-1",
          delta,
        })),
        { type: "tool-input-end", id: "call-1" },
        {
          type: "tool-call",
          toolCallId: "call-1",
          toolName: "showAnswer",
          input,
        },
        {
          type: "finish",
          finishReason: { unified: "tool-calls", raw: undefined },
          usage: {
            inputTokens: {
              total: 1,
              noCache: 1,
              cacheRead: undefined,
              cacheWrite: undefined,
            },
            outputTokens: { total: 1, text: 1, reasoning: undefined },
          },
        },
      ]),
    },
  })

  const response = await answerRoute(model, [
    {
      id: "question",
      role: "user",
      parts: [{ type: "text", text: "Catch me up on Mobile app" }],
    },
  ])

  if (!response.body) throw new Error("No stream")

  const chunks = parseJsonEventStream({
    stream: response.body,
    schema: uiMessageChunkSchema(),
  }).pipeThrough(
    new TransformStream({
      transform(
        result,
        controller: TransformStreamDefaultController<UIMessageChunk>,
      ) {
        if (result.success) controller.enqueue(result.value)
      },
    }),
  )

  const counts: number[] = []
  let last: UIMessage | undefined

  for await (const message of readUIMessageStream({ stream: chunks })) {
    const part = message.parts.find((item) => item.type === "tool-showAnswer")

    if (part && "state" in part && part.state === "input-streaming")
      counts.push(draft.parse(part.input).nodes.length)

    last = message
  }

  // The model was told about the library and given the tool's schema.
  const call = model.doStreamCalls[0]

  expect(JSON.stringify(call?.prompt)).toContain("## TaskList")
  expect(call?.tools?.[0]).toMatchObject({
    name: "showAnswer",
    inputSchema: { $schema: "http://json-schema.org/draft-07/schema#" },
  })

  // Parts of the answer arrived before the whole of it.
  const total = exampleAnswer.nodes.length

  expect(counts.some((count) => count > 0 && count < total)).toBe(true)

  const done = last?.parts.find((item) => item.type === "tool-showAnswer")

  expect(done).toMatchObject({
    state: "output-available",
    output: { shown: true },
  })
  const finished = draft.parse(done && "input" in done ? done.input : undefined)

  expect(finished.nodes.map((node) => node.type)).toEqual(
    exampleAnswer.nodes.map((node) => node.type),
  )
})
