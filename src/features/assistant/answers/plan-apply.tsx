import { useAnswerAction } from "@/kit/answer/answer-context"
import type { AnswerComponentProps } from "@/kit/answer/answer-library"
import { Button } from "@/kit/ui/button"
import { deferred } from "@/demo/capacity"
import { formatDate } from "@/demo/model"
import type { PlanApplyProps } from "@/demo/assistant/plan-schemas"
import { usePlan, type PlanView } from "./plan-context"

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`

/** When the plan lands: the project's date, or which projects stay late. */
function landing(view: PlanView) {
  if (view.kind === "project") {
    const { finish } = view.outcome

    return finish
      ? `lands ${formatDate(finish)}${finish > view.plan.dueDate ? ", after the due date" : ""}`
      : ""
  }

  const late = view.plan.projects.filter((project) => {
    const finish = view.outcome.projects.find(
      (item) => item.projectId === project.id,
    )?.finish

    return !finish || finish > project.dueDate
  })

  return late.length
    ? `${late.map((project) => project.name).join(", ")} still late`
    : "every project on time"
}

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

  const values = Object.values(view.moves)
  const moved = values.filter((to) => to !== deferred).length
  const waiting = values.filter((to) => to === deferred).length

  const summary =
    moved || waiting
      ? [
          moved && `${plural(moved, "task")} ${moved === 1 ? "moves" : "move"}`,
          waiting && `${plural(waiting, "task")} deferred`,
          landing(view),
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
            text:
              view.kind === "project"
                ? `${props.label} to ${view.plan.projectName}`
                : props.label,
            values: { moves: view.moves },
            nodeId,
          })
        }
      >
        {props.label}
      </Button>
    </div>
  )
}
