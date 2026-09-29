import type { ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { ProjectMark } from "@/components/project-identity"
import type { Project } from "@/demo/model"
import { monthGrid, nextMonth } from "@/demo/project-timeline"

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function monthLabel(month: string) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T00:00:00Z`))
}

function dayLabel(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`))
}

// Due dates on a month grid (TABL-14). Narrow screens list only the days
// that have projects due, so the month stays readable on a phone.
export function ProjectCalendar({
  projects,
  month,
  referenceDate,
  onMonthChange,
  renderName,
}: {
  projects: Project[]
  /** "YYYY-MM" */
  month: string
  referenceDate: string
  onMonthChange: (month: string) => void
  renderName: (project: Project) => ReactNode
}) {
  const days = monthGrid(month)
  const due = projects.filter((project) => project.dueDate.startsWith(month))

  return (
    <div className="month-calendar">
      <div className="month-calendar-heading">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Previous month"
          onClick={() => onMonthChange(nextMonth(month, -1))}
        >
          <ChevronLeft aria-hidden="true" />
        </Button>
        <h3 aria-live="polite">{monthLabel(month)}</h3>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Next month"
          onClick={() => onMonthChange(nextMonth(month, 1))}
        >
          <ChevronRight aria-hidden="true" />
        </Button>
        <p className="month-calendar-count">
          {due.length} {due.length === 1 ? "project" : "projects"} due
        </p>
      </div>
      <div className="month-weekdays" aria-hidden="true">
        {weekdays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <ol className="month-grid">
        {days.map(({ date, inMonth }) => {
          const items = projects.filter((project) => project.dueDate === date)

          return (
            <li
              key={date}
              data-outside={!inMonth || undefined}
              data-today={date === referenceDate || undefined}
              data-empty={items.length === 0 || undefined}
            >
              <span className="month-day">
                <span aria-hidden="true">{Number(date.slice(8))}</span>
                <span className="sr-only">{dayLabel(date)}</span>
              </span>
              {items.length > 0 && (
                <ul>
                  {items.map((project) => (
                    <li key={project.id}>
                      <ProjectMark color={project.color} />
                      {renderName(project)}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ol>
      {due.length === 0 && (
        <p className="month-calendar-empty">No projects are due this month.</p>
      )}
    </div>
  )
}
