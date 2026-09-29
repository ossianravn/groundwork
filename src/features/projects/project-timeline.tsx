import type { CSSProperties, ReactNode } from "react"
import { formatDate, statusLabels, type Project } from "@/demo/model"
import { projectColorStyle } from "@/components/project-color"
import {
  daysBetween,
  timelineRange,
  type TimelineRow,
} from "@/demo/project-timeline"

type TimelineStyle = CSSProperties & Record<`--${string}`, string | number>

// Projects across time (TABL-14): each bar runs from the first activity to
// the due date, filled to the share of tasks done. The name column stays
// put while the dates scroll; a line marks the snapshot date.
export function ProjectTimeline({
  rows,
  referenceDate,
  renderName,
}: {
  rows: TimelineRow[]
  referenceDate: string
  renderName: (project: Project) => ReactNode
}) {
  const range = timelineRange(rows, referenceDate)

  const style: TimelineStyle = {
    "--timeline-days": range.days,
    "--timeline-today": daysBetween(range.start, referenceDate) + 0.5,
  }

  return (
    <div className="timeline-scroll">
      <div className="timeline" style={style}>
        <div className="timeline-axis" aria-hidden="true">
          {range.weeks.map((week) => (
            <span key={week}>{formatDate(week)}</span>
          ))}
        </div>
        <ol className="timeline-rows" aria-label="Projects by date">
          {rows.map(({ project, start, end }) => {
            const percent = project.tasks
              ? Math.round((project.completedTasks / project.tasks) * 100)
              : 0

            const overdue =
              project.status !== "completed" && end < referenceDate

            const bar: TimelineStyle = {
              ...projectColorStyle(project.color),
              "--start": daysBetween(range.start, start),
              "--span": daysBetween(start, end) + 1,
              "--done": `${percent}%`,
            }

            return (
              <li key={project.id} className="timeline-row" style={bar}>
                <div className="timeline-name">
                  {renderName(project)}
                  <span
                    className="timeline-meta"
                    data-overdue={overdue || undefined}
                  >
                    {overdue ? "Overdue" : "Due"} {formatDate(end)} · {percent}%
                  </span>
                </div>
                <div className="timeline-track" aria-hidden="true">
                  <span className="timeline-bar" data-status={project.status}>
                    <span className="timeline-fill" />
                  </span>
                </div>
                <p className="sr-only">
                  {statusLabels[project.status]}, from{" "}
                  {formatDate(start, { year: "numeric" })} to{" "}
                  {formatDate(end, { year: "numeric" })}, {percent}% of tasks
                  done.
                </p>
              </li>
            )
          })}
        </ol>
        <span className="timeline-today" aria-hidden="true">
          <span>{formatDate(referenceDate)}</span>
        </span>
      </div>
    </div>
  )
}
