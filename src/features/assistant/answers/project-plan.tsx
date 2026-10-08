import { useAnswer, useAnswerState } from "@/kit/answer/answer-context"
import type { AnswerComponentProps } from "@/kit/answer/answer-library"
import { planOutcome } from "@/demo/capacity"
import { planMoves } from "@/demo/assistant/land-apply"
import { movesOf } from "@/demo/assistant/land-plan"
import type { ProjectPlanProps } from "@/demo/assistant/plan-schemas"
import { PlanContext } from "./plan-context"

/**
 * A plan for a project's remaining work. It keeps the person's moves in the
 * answer's state (starting from the proposal), works out what they come to,
 * and shares both with the views inside it, so they stay linked.
 */
export function ProjectPlan({
  props,
  children,
}: AnswerComponentProps<ProjectPlanProps>) {
  const { interactive, streaming } = useAnswer()
  const { people, tasks, referenceDate } = props

  const [moves, setMoves] = useAnswerState(
    "plan",
    planMoves,
    movesOf(props.changes),
  )

  return (
    <PlanContext
      value={{
        plan: props,
        moves,
        setMoves,
        outcome: planOutcome(people, tasks, moves, referenceDate),
        assigned: planOutcome(people, tasks, {}, referenceDate),
        editable: interactive && !streaming,
      }}
    >
      <section
        data-slot="project-plan"
        aria-label={`Plan for ${props.projectName}`}
        className="grid min-w-0 gap-(--section-gap)"
      >
        {children}
      </section>
    </PlanContext>
  )
}
