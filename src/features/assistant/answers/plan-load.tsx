import { useId, type CSSProperties } from "react"
import { cn } from "cn"
import type { AnswerComponentProps } from "@/kit/answer/answer-library"
import { hueColor } from "@/kit/ui/chart-colors"
import { formatDate } from "@/demo/model"
import type {
  PlanViewProps,
  TeamPlanProps,
} from "@/demo/assistant/plan-schemas"
import { usePlan, type PlanView } from "./plan-context"

const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`

interface LoadRow {
  id: string
  name: string
  tasks: number
  /** Their tasks as assigned now, when the plan changes it. */
  was?: number
  finish: string | null
  late: boolean
  /** Their finish sets the project's date (a project's plan). */
  sets: boolean
  /** The bar: one segment, or one per project across the team. */
  segments: { key: string; label: string; tasks: number; color: string }[]
}

/** Each person's load with the plan applied, and the scale for the bars. */
function loadRows(view: PlanView) {
  // The scale holds still while the person edits.
  const most = Math.max(
    1,
    ...[...view.outcome.load, ...view.assigned.load].map((item) => item.tasks),
  )

  if (view.kind === "project") {
    const { plan, outcome } = view

    const rows = plan.people.flatMap((person): LoadRow[] => {
      const load = outcome.load.find((item) => item.personId === person.id)

      if (!load) return []

      const late = !load.finish || load.finish > plan.dueDate

      return [
        {
          id: person.id,
          name: person.name,
          tasks: load.tasks,
          finish: load.finish,
          late,
          sets: load.finish === outcome.finish,
          segments: [
            {
              key: "tasks",
              label: plan.projectName,
              tasks: load.tasks,
              color: late ? "var(--warning)" : "var(--brand)",
            },
          ],
        },
      ]
    })

    return { rows, most: Math.max(most, outcome.unowned) }
  }

  const { plan, outcome, assigned } = view
  const due = new Map(plan.projects.map((item) => [item.id, item.dueDate]))

  const rows = plan.people.flatMap((person): LoadRow[] => {
    const load = outcome.load.find((item) => item.personId === person.id)
    const before = assigned.load.find((item) => item.personId === person.id)

    if (!load && !before) return []

    const parts = load?.projects ?? []

    return [
      {
        id: person.id,
        name: person.name,
        tasks: load?.tasks ?? 0,
        was: before?.tasks ?? 0,
        finish: load ? load.finish : null,
        late: parts.some(
          (part) =>
            !part.finish || part.finish > (due.get(part.projectId) ?? ""),
        ),
        sets: false,
        segments: parts.map((part) => {
          const project = plan.projects.find((p) => p.id === part.projectId)

          return {
            key: part.projectId,
            label: project?.name ?? "A project",
            tasks: part.tasks,
            color: project
              ? hueColor(project.color)
              : "var(--muted-foreground)",
          }
        }),
      },
    ]
  })

  return { rows, most }
}

/** Which colour is which project, for the bars stacked by project. */
function ProjectKey({ projects }: { projects: TeamPlanProps["projects"] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-(length:--text-meta) text-muted-foreground">
      {projects.map((project) => {
        const swatch: CSSProperties & Record<"--project-color", string> = {
          "--project-color": hueColor(project.color),
        }

        return (
          <li key={project.id} className="inline-flex items-center gap-1.5">
            <span className="project-dot" style={swatch} aria-hidden="true" />
            {project.name}
          </li>
        )
      })}
    </ul>
  )
}

/** A row's outcome in words: its tasks (and the change), and when it clears. */
function rowText(row: LoadRow) {
  const change = row.was !== undefined && row.was !== row.tasks
  const tasks = `${plural(row.tasks, "task")}${change ? ` (was ${row.was})` : ""}`

  if (!row.tasks) return tasks

  const finish = row.finish
    ? `done ${formatDate(row.finish)}`
    : "no recent pace"

  return `${tasks} · ${finish}${row.late && row.finish ? ", late" : ""}${row.sets && !row.late ? ", sets the date" : ""}`
}

/**
 * Who finishes when: each person's tasks with the plan applied, and the day
 * they clear them. In a project's plan the latest sets its date; across the
 * team each bar is stacked by project, in the order the person works. Anyone
 * who would land a project after its due date is marked late.
 */
export function PlanLoad({ props }: AnswerComponentProps<PlanViewProps>) {
  const view = usePlan()
  const titleId = useId()

  if (!view) return null

  const { rows, most } = loadRows(view)

  return (
    <section className="grid gap-3" aria-labelledby={titleId}>
      <h3 id={titleId} className="font-heading text-sm font-semibold">
        {props.title ?? "Who finishes when"}
      </h3>
      {view.kind === "team" && <ProjectKey projects={view.plan.projects} />}
      {/* One grid for every row, so all bars share a track length; phones
          put each name above its bar. */}
      <ul className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 sm:grid-cols-[minmax(6rem,9rem)_minmax(0,1fr)_auto] sm:gap-y-2.5">
        {rows.map((row) => (
          <li
            key={row.id}
            className="col-span-full grid grid-cols-subgrid items-center gap-y-1 text-sm max-sm:pb-1.5"
          >
            <span className="truncate font-medium max-sm:col-span-full">
              {row.name}
            </span>
            <span className="flex h-2 gap-px overflow-hidden rounded-full bg-muted">
              {row.segments.map((segment) => (
                <span
                  key={segment.key}
                  title={`${segment.label}: ${plural(segment.tasks, "task")}`}
                  className="block h-full transition-[width] duration-300 last:rounded-e-full motion-reduce:transition-none"
                  style={{
                    width: `${(segment.tasks / most) * 100}%`,
                    background: segment.color,
                  }}
                />
              ))}
            </span>
            <span
              className={cn(
                "text-(length:--text-meta) tabular-nums",
                row.late ? "text-(--warning)" : "text-muted-foreground",
              )}
            >
              {rowText(row)}
              {row.segments.length > 1 && (
                <span className="sr-only">
                  {`: ${row.segments.map((s) => `${s.label} ${s.tasks}`).join(", ")}`}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      {view.kind === "project" &&
        (view.outcome.unowned > 0 || view.outcome.deferred > 0) && (
          <p className="text-(length:--text-meta) text-muted-foreground">
            {[
              view.outcome.unowned &&
                `${plural(view.outcome.unowned, "task")} without an owner, not in the date`,
              view.outcome.deferred &&
                `${plural(view.outcome.deferred, "task")} deferred`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
    </section>
  )
}
