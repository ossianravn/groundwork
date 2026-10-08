import * as React from "react"
import type { PlanMoves, PlanOutcome } from "@/demo/capacity"
import type { ProjectPlanProps } from "@/demo/assistant/plan-schemas"

/** What a plan's views share: its data, the person's moves and what they come to. */
export interface PlanView {
  plan: ProjectPlanProps
  moves: PlanMoves
  setMoves: (moves: PlanMoves) => void
  /** The plan with the person's moves. */
  outcome: PlanOutcome
  /** The project as it is assigned now. */
  assigned: PlanOutcome
  /** The plan takes edits: the latest answer, finished streaming. */
  editable: boolean
}

export const PlanContext = React.createContext<PlanView | null>(null)

/** The enclosing plan; views outside a ProjectPlan draw nothing. */
export function usePlan() {
  return React.useContext(PlanContext)
}
