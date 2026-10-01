import { CalendarHeatmap } from "@/kit/ui/calendar-heatmap"
import { formatDate, type Activity } from "@/demo/model"
import { windowDates } from "@/demo/report-period"
import { weekStart } from "@/demo/project-timeline"

const tasks = (value: number) =>
  `${value} ${value === 1 ? "task" : "tasks"} completed`

/**
 * When the team ships: completed tasks per day across the recorded history,
 * as a calendar (DVIZ-13). It follows the feed's filters, so choosing a
 * person or event type shows their rhythm.
 */
export function ActivityHeatmap({
  events,
  start,
  end,
}: {
  /** The feed's events after its filters. */
  events: Activity[]
  /** The first day of recorded history; the calendar starts that week. */
  start: string
  end: string
}) {
  const totals = new Map<string, number>()

  for (const event of events)
    totals.set(event.date, (totals.get(event.date) ?? 0) + event.tasksCompleted)

  const days = windowDates({ start: weekStart(start), end }).map((date) => ({
    date,
    value: totals.get(date) ?? 0,
  }))

  const total = days.reduce((sum, item) => sum + item.value, 0)
  const busiest = [...days].sort((a, b) => b.value - a.value)[0]

  return (
    <section
      className="activity-heatmap"
      aria-labelledby="activity-heatmap-title"
    >
      <header>
        <h2 id="activity-heatmap-title">
          <span className="activity-heatmap-total">{total}</span> tasks
          completed since {formatDate(start)}
        </h2>
        {busiest?.value ? (
          <p>
            Busiest day: {formatDate(busiest.date)}, {tasks(busiest.value)}.
          </p>
        ) : (
          <p>No completed tasks match these filters.</p>
        )}
      </header>
      <CalendarHeatmap
        days={days}
        label="Completed tasks by day"
        describe={tasks}
      />
    </section>
  )
}
