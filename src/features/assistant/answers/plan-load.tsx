import { useId } from "react"
import { cn } from "cn"
import type { AnswerComponentProps } from "@/kit/answer/answer-library"
import { formatDate } from "@/demo/model"
import type { PlanViewProps } from "@/demo/assistant/plan-schemas"
import { usePlan } from "./plan-context"

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`

/**
 * Who finishes when: each person's tasks in the project with the plan
 * applied, and the day they clear them. The latest sets the project's
 * date; anyone past the due date is marked late.
 */
export function PlanLoad({ props }: AnswerComponentProps<PlanViewProps>) {
  const view = usePlan()
  const titleId = useId()

  if (!view) return null

  const { plan, outcome } = view

  const rows = plan.people.flatMap((person) => {
    const load = outcome.load.find((item) => item.personId === person.id)

    return load ? [{ id: person.id, name: person.name, ...load }] : []
  })

  const most = Math.max(1, ...rows.map((row) => row.tasks), outcome.unowned)

  return (
    <section className="grid gap-3" aria-labelledby={titleId}>
      <h3 id={titleId} className="font-heading text-sm font-semibold">
        {props.title ?? "Who finishes when"}
      </h3>
      {/* One grid for every row, so all bars share a track length; phones
          put each name above its bar. */}
      <ul className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 sm:grid-cols-[minmax(6rem,9rem)_minmax(0,1fr)_auto] sm:gap-y-2.5">
        {rows.map((row) => {
          const late = !row.finish || row.finish > plan.dueDate
          const last = row.finish === outcome.finish

          return (
            <li
              key={row.id}
              className="col-span-full grid grid-cols-subgrid items-center gap-y-1 text-sm max-sm:pb-1.5"
            >
              <span className="truncate font-medium max-sm:col-span-full">
                {row.name}
              </span>
              <span className="h-2 overflow-hidden rounded-full bg-muted">
                <span
                  className={cn(
                    "block h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none",
                    late ? "bg-(--warning)" : "bg-brand",
                  )}
                  style={{ width: `${(row.tasks / most) * 100}%` }}
                />
              </span>
              <span
                className={cn(
                  "text-(length:--text-meta) tabular-nums",
                  late ? "text-(--warning)" : "text-muted-foreground",
                )}
              >
                {plural(row.tasks, "task")} ·{" "}
                {row.finish
                  ? `done ${formatDate(row.finish)}`
                  : "no recent pace"}
                {late && row.finish ? ", late" : ""}
                {last && !late ? ", sets the date" : ""}
              </span>
            </li>
          )
        })}
      </ul>
      {(outcome.unowned > 0 || outcome.deferred > 0) && (
        <p className="text-(length:--text-meta) text-muted-foreground">
          {[
            outcome.unowned &&
              `${plural(outcome.unowned, "task")} without an owner, not in the date`,
            outcome.deferred && `${plural(outcome.deferred, "task")} deferred`,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
    </section>
  )
}
