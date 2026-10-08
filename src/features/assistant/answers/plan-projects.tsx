import { useId, type CSSProperties } from "react"
import { cn } from "cn"
import type { AnswerComponentProps } from "@/kit/answer/answer-library"
import { hueColor } from "@/kit/ui/chart-colors"
import { formatDate } from "@/demo/model"
import type { PlanViewProps } from "@/demo/assistant/plan-schemas"
import { usePlan } from "./plan-context"

const dayNumber = (date: string) => Date.parse(`${date}T00:00:00Z`) / 86_400_000

/**
 * When each project lands with the plan, against its due date: a bar from
 * today to the day it lands and a tick on the due date, on one scale for
 * every project, with the date as assigned now when the plan changes it.
 * Inside a team's plan only.
 */
export function PlanProjects({ props }: AnswerComponentProps<PlanViewProps>) {
  const view = usePlan()
  const titleId = useId()

  if (view?.kind !== "team") return null

  const { plan, outcome, assigned } = view

  const finishOf = (list: typeof outcome.projects, id: string) =>
    list.find((item) => item.projectId === id)?.finish ?? null

  // One scale from today to the latest date in view, held while editing.
  const start = dayNumber(plan.referenceDate)

  const end = Math.max(
    start + 1,
    ...plan.projects.map((project) => dayNumber(project.dueDate)),
    ...[...outcome.projects, ...assigned.projects].flatMap((item) =>
      item.finish ? [dayNumber(item.finish)] : [],
    ),
  )

  const at = (date: string) =>
    Math.min(100, ((dayNumber(date) - start) / (end - start)) * 100)

  const unowned = plan.projects.filter((project) => project.unowned > 0)

  return (
    <section className="grid gap-3" aria-labelledby={titleId}>
      <h3 id={titleId} className="font-heading text-sm font-semibold">
        {props.title ?? "When each project lands"}
      </h3>
      <ul className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 sm:grid-cols-[minmax(6rem,9rem)_minmax(0,1fr)_auto] sm:gap-y-2.5">
        {plan.projects.map((project) => {
          const finish = finishOf(outcome.projects, project.id)
          const was = finishOf(assigned.projects, project.id)
          const late = !finish || finish > project.dueDate

          const mark: CSSProperties & Record<"--project-color", string> = {
            "--project-color": hueColor(project.color),
          }

          return (
            <li
              key={project.id}
              className="col-span-full grid grid-cols-subgrid items-center gap-y-1 text-sm max-sm:pb-1.5"
            >
              <span className="flex min-w-0 items-center gap-1.5 font-medium max-sm:col-span-full">
                <span className="project-dot" style={mark} aria-hidden="true" />
                <span className="truncate">{project.name}</span>
              </span>
              <span className="relative h-2 rounded-full bg-muted">
                {/* What the plan saves: as assigned, it would run to here. */}
                {finish && was && was > finish && (
                  <span
                    className="absolute inset-y-0 rounded-e-full bg-foreground/15 transition-[inset-inline-start,width] duration-300 motion-reduce:transition-none"
                    style={{
                      insetInlineStart: `${at(finish)}%`,
                      width: `${at(was) - at(finish)}%`,
                    }}
                  />
                )}
                {finish && (
                  <span
                    className={cn(
                      "absolute inset-y-0 start-0 rounded-full transition-[width] duration-300 motion-reduce:transition-none",
                      late ? "bg-(--warning)" : "bg-brand",
                    )}
                    style={{ width: `${at(finish)}%` }}
                  />
                )}
                <span
                  className="absolute -inset-y-1 w-0.5 -translate-x-1/2 rounded-full bg-foreground"
                  style={{ insetInlineStart: `${at(project.dueDate)}%` }}
                  title={`Due ${formatDate(project.dueDate)}`}
                />
              </span>
              <span
                className={cn(
                  "text-(length:--text-meta) tabular-nums",
                  late ? "text-(--warning)" : "text-muted-foreground",
                )}
              >
                {finish ? formatDate(finish) : "No date"}
                {late && finish ? ", late" : ""}
                {` · due ${formatDate(project.dueDate)}`}
                {was !== finish && was ? ` (was ${formatDate(was)})` : ""}
              </span>
            </li>
          )
        })}
      </ul>
      {unowned.length > 0 && (
        <p className="text-(length:--text-meta) text-muted-foreground">
          {`Without an owner, not in these dates: ${unowned.map((project) => `${project.name} ${project.unowned}`).join(", ")}.`}
        </p>
      )}
    </section>
  )
}
