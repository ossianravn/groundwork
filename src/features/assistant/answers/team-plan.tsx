import { useAnswer, useAnswerState } from "@/kit/answer/answer-context"
import type { AnswerComponentProps } from "@/kit/answer/answer-library"
import { teamOutcome } from "@/demo/capacity"
import { planMoves } from "@/demo/assistant/plan-actions"
import { movesOf } from "@/demo/assistant/land-plan"
import type { TeamPlanProps } from "@/demo/assistant/plan-schemas"
import { PlanContext } from "./plan-context"

/**
 * A plan across the team's open projects: who holds what, and when each
 * project lands. Like a project's plan, it keeps the person's moves in the
 * answer's state and shares what they come to with the views inside it.
 */
export function TeamPlan({
  props,
  children,
}: AnswerComponentProps<TeamPlanProps>) {
  const { interactive, streaming } = useAnswer()
  const { people, projects, tasks, referenceDate } = props

  const [moves, setMoves] = useAnswerState(
    "plan",
    planMoves,
    movesOf(props.changes),
  )

  return (
    <PlanContext
      value={{
        kind: "team",
        plan: props,
        moves,
        setMoves,
        outcome: teamOutcome(people, projects, tasks, moves, referenceDate),
        assigned: teamOutcome(people, projects, tasks, {}, referenceDate),
        editable: interactive && !streaming,
      }}
    >
      <section
        data-slot="team-plan"
        aria-label="Plan for the team"
        className="grid min-w-0 gap-(--section-gap)"
      >
        {children}
      </section>
    </PlanContext>
  )
}
