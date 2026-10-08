import type { Pace, TimedChunk } from "./assistant-chunks"
import type { ShowAnswerInput } from "./assistant-types"

/**
 * An answer as a model writes it: a showAnswer call whose JSON input
 * arrives in small deltas (the client parses each prefix, so the answer
 * renders as it is written), then completes at once. A new step follows,
 * as after any tool that runs on the server, so useChat sends nothing back.
 */
export function answerChunks(
  answer: ShowAnswerInput,
  turn: string,
  pace: Pace,
): TimedChunk[] {
  const toolCallId = `answer-${turn}`
  const deltas = JSON.stringify(answer).match(/[\s\S]{1,16}/gu) ?? []

  return [
    {
      delay: 0,
      chunk: { type: "tool-input-start", toolCallId, toolName: "showAnswer" },
    },
    ...deltas.map((inputTextDelta): TimedChunk => ({
      delay: pace.chunk,
      chunk: { type: "tool-input-delta", toolCallId, inputTextDelta },
    })),
    {
      delay: 0,
      chunk: {
        type: "tool-input-available",
        toolCallId,
        toolName: "showAnswer",
        input: answer,
      },
    },
    {
      delay: 0,
      chunk: {
        type: "tool-output-available",
        toolCallId,
        output: { shown: true },
      },
    },
    { delay: 0, chunk: { type: "finish-step" } },
    { delay: 0, chunk: { type: "start-step" } },
  ]
}
