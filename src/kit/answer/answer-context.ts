import * as React from "react"
import type { z } from "zod"
import type { AnswerState, AnswerValue } from "./answer-library"

/** Something an answer asks the host to do: send a turn, for instance. */
export interface AnswerAction {
  type: "send"
  /** What the person's message says, as a sentence. */
  text: string
  /** The structured choices behind it, for the model. */
  values?: AnswerState
  /** The node it came from. */
  nodeId: string
}

export interface AnswerContextValue {
  /** The answer is still being written. */
  streaming: boolean
  /** The answer takes edits and actions (usually only the latest one). */
  interactive: boolean
  state: AnswerState
  setState: (key: string, value: AnswerValue) => void
  act?: (action: AnswerAction) => void
}

export const AnswerContext = React.createContext<AnswerContextValue>({
  streaming: false,
  interactive: false,
  state: {},
  setState: () => {},
})

export const AnswerNodeContext = React.createContext<{
  id: string
  /** This node is the one still being written. */
  open: boolean
}>({ id: "", open: false })

/** Whether the answer is still streaming and whether it takes edits. */
export function useAnswer() {
  const { streaming, interactive } = React.useContext(AnswerContext)

  return { streaming, interactive }
}

/** This node's id, and whether it is still being written. */
export function useAnswerNode() {
  return React.useContext(AnswerNodeContext)
}

/**
 * A value the person changes inside the answer, kept by the host with the
 * answer (so it survives scrolling away and travels with the next turn).
 * Components of one answer that use the same key stay linked. The schema
 * validates what the host restores; anything else reads as `initial`.
 */
export function useAnswerState<Value extends AnswerValue>(
  key: string,
  schema: z.ZodType<Value>,
  initial: Value,
) {
  const { state, setState } = React.useContext(AnswerContext)
  const parsed = schema.safeParse(state[key])

  const set = React.useCallback(
    (value: Value) => setState(key, value),
    [key, setState],
  )

  return [parsed.success ? parsed.data : initial, set] as const
}

/**
 * Sends an action to the host, or undefined while the answer streams, when
 * it no longer takes actions, or when the host handles none.
 */
export function useAnswerAction() {
  const { streaming, interactive, act } = React.useContext(AnswerContext)

  return !streaming && interactive ? act : undefined
}
