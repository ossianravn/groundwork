import type { Pace, TimedChunk } from "./assistant-chunks"
import type { ApplyPlanInput, ShowAnswerInput } from "./assistant-types"

/** Applying a plan: the call, then a request for the person's approval. */
export function applyChunks(
  input: ApplyPlanInput,
  turn: string,
  pace: Pace,
): TimedChunk[] {
  const toolCallId = `apply-${turn}`

  return [
    {
      delay: 0,
      chunk: { type: "tool-input-start", toolCallId, toolName: "applyPlan" },
    },
    {
      delay: 0,
      chunk: {
        type: "tool-input-available",
        toolCallId,
        toolName: "applyPlan",
        input,
      },
    },
    {
      delay: pace.chunk,
      chunk: {
        type: "tool-approval-request",
        approvalId: `approve-${turn}`,
        toolCallId,
      },
    },
  ]
}

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
  const json = JSON.stringify(answer)

  // About 120 deltas whatever the size, so a large answer still arrives in
  // a few seconds; the client re-parses the whole input after each one.
  const size = Math.max(16, Math.ceil(json.length / 120))
  const deltas = json.match(new RegExp(`[\\s\\S]{1,${size}}`, "gu")) ?? []

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
