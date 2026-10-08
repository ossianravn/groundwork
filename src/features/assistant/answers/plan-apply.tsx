import { useAnswerAction } from "@/kit/answer/answer-context"
import type { AnswerComponentProps } from "@/kit/answer/answer-library"
import { Button } from "@/kit/ui/button"
import { deferred } from "@/demo/capacity"
import { formatDate } from "@/demo/model"
import type { PlanApplyProps } from "@/demo/assistant/plan-schemas"
import { usePlan } from "./plan-context"

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`

/**
 * What the plan comes to, and the action that asks to apply it. Applying
 * goes through the assistant, which asks for approval before anything
 * changes; the summary is announced as the person edits.
 */
export function PlanApply({
  props,
  nodeId,
}: AnswerComponentProps<PlanApplyProps>) {
  const view = usePlan()
  const act = useAnswerAction()

  if (!view) return null

  const { plan, moves, outcome } = view
  const values = Object.values(moves)
  const moved = values.filter((to) => to !== deferred).length
  const waiting = values.filter((to) => to === deferred).length

  const summary =
    moved || waiting
      ? [
          moved && `${plural(moved, "task")} ${moved === 1 ? "moves" : "move"}`,
          waiting && `${plural(waiting, "task")} deferred`,
          outcome.finish &&
            `lands ${formatDate(outcome.finish)}${outcome.finish > plan.dueDate ? ", after the due date" : ""}`,
        ]
          .filter(Boolean)
          .join(" · ")
      : "No changes: the plan keeps every task where it is"

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-lg bg-muted px-3 py-2">
      <p className="text-sm" aria-live="polite">
        {summary}
      </p>
      <Button
        size="sm"
        disabled={!act || !(moved || waiting)}
        onClick={() =>
          act?.({
            type: "send",
            text: `${props.label} to ${plan.projectName}`,
            values: { moves },
            nodeId,
          })
        }
      >
        {props.label}
      </Button>
    </div>
  )
}
