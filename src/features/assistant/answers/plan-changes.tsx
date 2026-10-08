import { useId, useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "cn"
import type { AnswerComponentProps } from "@/kit/answer/answer-library"
import { Button } from "@/kit/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"
import { deferred, type PlanMoves } from "@/demo/capacity"
import type {
  PlanViewProps,
  ProjectPlanProps,
} from "@/demo/assistant/plan-schemas"
import { usePlan } from "./plan-context"

type Change = ProjectPlanProps["changes"][number]

const unowned = "none"

/** How much of a change the plan holds now. */
function coverage(change: Change, moves: PlanMoves) {
  const kept = change.moves.filter((move) => moves[move.taskId] === move.to)

  return kept.length === change.moves.length
    ? "included"
    : kept.length
      ? "edited"
      : "left out"
}

/** The moves without the given tasks: they stay where they are. */
const without = (moves: PlanMoves, ids: string[]) =>
  Object.fromEntries(Object.entries(moves).filter(([id]) => !ids.includes(id)))

function ChangeRow({ change }: { change: Change }) {
  const view = usePlan()
  const [open, setOpen] = useState(false)
  const listId = useId()

  if (!view) return null

  const { plan, moves, setMoves, editable } = view
  const state = coverage(change, moves)
  const ids = change.moves.map((move) => move.taskId)

  const holders = [
    ...plan.people.map((person) => ({ value: person.id, label: person.name })),
    { value: deferred, label: "Defer" },
    ...(change.from ? [] : [{ value: unowned, label: "No owner" }]),
  ]

  return (
    <li className="grid gap-2 border-b border-border py-3 last:border-b-0">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="grid min-w-0 gap-0.5">
          <p
            className={cn(
              "text-sm font-medium",
              state === "left out" && "text-muted-foreground",
            )}
          >
            {change.title}
          </p>
          <p className="text-(length:--text-meta) text-muted-foreground">
            {state === "included"
              ? "In the plan"
              : state === "edited"
                ? "In the plan, edited"
                : "Not in the plan"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={open}
            aria-controls={listId}
            onClick={() => setOpen(!open)}
          >
            {`${change.moves.length} ${change.moves.length === 1 ? "task" : "tasks"}`}
            <ChevronDown
              aria-hidden="true"
              className={cn("transition-transform", open && "rotate-180")}
            />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!editable}
            onClick={() =>
              setMoves(
                state === "included"
                  ? without(moves, ids)
                  : {
                      ...moves,
                      ...Object.fromEntries(
                        change.moves.map((move) => [move.taskId, move.to]),
                      ),
                    },
              )
            }
          >
            {state === "included"
              ? "Remove"
              : change.proposed
                ? "Add back"
                : "Add to plan"}
          </Button>
        </div>
      </div>
      {open && (
        <ul id={listId} className="grid gap-1.5 ps-3">
          {change.moves.map((move) => {
            const task = plan.tasks.find((item) => item.id === move.taskId)
            const original = task?.assigneeId ?? unowned
            const value = moves[move.taskId] ?? original

            return (
              <li
                key={move.taskId}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-sm"
              >
                <span className="truncate" title={task?.title}>
                  {task?.title ?? "A removed task"}
                </span>
                <Select
                  items={holders}
                  value={value}
                  disabled={!editable}
                  onValueChange={(next) => {
                    if (!next) return

                    setMoves(
                      next === original
                        ? without(moves, [move.taskId])
                        : { ...moves, [move.taskId]: next },
                    )
                  }}
                >
                  <SelectTrigger
                    size="sm"
                    aria-label={`Who takes ${task?.title ?? "this task"}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {holders.map((holder) => (
                      <SelectItem key={holder.value} value={holder.value}>
                        {holder.label}
                        {holder.value === original ? " (now)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </li>
            )
          })}
        </ul>
      )}
    </li>
  )
}

/**
 * The plan's changes, like stops on a route: each proposed one is in the
 * plan until the person removes it, options can be added, and any task can
 * go elsewhere. The projection and load follow every edit.
 */
export function PlanChanges({ props }: AnswerComponentProps<PlanViewProps>) {
  const view = usePlan()
  const titleId = useId()

  if (!view) return null

  const proposed = view.plan.changes.filter((change) => change.proposed)
  const options = view.plan.changes.filter((change) => !change.proposed)

  return (
    <section className="grid gap-1" aria-labelledby={titleId}>
      <h3 id={titleId} className="font-heading text-sm font-semibold">
        {props.title ?? "Changes"}
      </h3>
      {proposed.length ? (
        <ul>
          {proposed.map((change) => (
            <ChangeRow key={change.id} change={change} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nothing needs to change.
        </p>
      )}
      {options.length > 0 && (
        <>
          <h4 className="mt-2 text-(length:--text-meta) font-medium text-muted-foreground">
            More options
          </h4>
          <ul>
            {options.map((change) => (
              <ChangeRow key={change.id} change={change} />
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
