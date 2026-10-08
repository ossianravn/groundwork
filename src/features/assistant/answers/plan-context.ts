import * as React from "react"
import type { PlanMoves, PlanOutcome, TeamOutcome } from "@/demo/capacity"
import type {
  ProjectPlanProps,
  TeamPlanProps,
} from "@/demo/assistant/plan-schemas"

interface PlanEdits {
  moves: PlanMoves
  setMoves: (moves: PlanMoves) => void
  /** The plan takes edits: the latest answer, finished streaming. */
  editable: boolean
}

/**
 * What a plan's views share: its data, the person's moves and what they
 * come to, either for one project or across the team's projects.
 */
export type PlanView = PlanEdits &
  (
    | {
        kind: "project"
        plan: ProjectPlanProps
        /** The plan with the person's moves. */
        outcome: PlanOutcome
        /** The project as it is assigned now. */
        assigned: PlanOutcome
      }
    | {
        kind: "team"
        plan: TeamPlanProps
        outcome: TeamOutcome
        assigned: TeamOutcome
      }
  )

export const PlanContext = React.createContext<PlanView | null>(null)

/** The enclosing plan; views outside a plan draw nothing. */
export function usePlan() {
  return React.useContext(PlanContext)
}
