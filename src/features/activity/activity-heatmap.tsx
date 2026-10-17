import { CalendarHeatmap } from "@/kit/ui/calendar-heatmap"
import { MemberAvatar } from "@/kit/member-avatar"
import { formatDate, type Activity, type Member } from "@/demo/model"
import { windowDates } from "@/demo/report-period"
import { weekStart } from "@/demo/project-timeline"

const tasks = (value: number) =>
  `${value} ${value === 1 ? "task" : "tasks"} completed`

const count = (value: number) => `${value} ${value === 1 ? "task" : "tasks"}`

/**
 * When the team ships: completed tasks per day across the recorded history,
 * as a calendar (DVIZ-13), beside what it shows at a glance: the busiest
 * day, who completed most and how many days saw work finished. It follows
 * the feed's filters, so choosing a person or event type shows their rhythm.
 */
export function ActivityHeatmap({
  events,
  people,
  start,
  end,
}: {
  /** The feed's events after its filters. */
  events: Activity[]
  people: Member[]
  /** The first day of recorded history; the calendar starts that week. */
  start: string
  end: string
}) {
  const totals = new Map<string, number>()
  const byMember = new Map<string, number>()

  for (const event of events) {
    totals.set(event.date, (totals.get(event.date) ?? 0) + event.tasksCompleted)
    byMember.set(
      event.memberId,
      (byMember.get(event.memberId) ?? 0) + event.tasksCompleted,
    )
  }

  const days = windowDates({ start: weekStart(start), end }).map((date) => ({
    date,
    value: totals.get(date) ?? 0,
  }))

  const total = days.reduce((sum, item) => sum + item.value, 0)
  const busiest = [...days].sort((a, b) => b.value - a.value)[0]
  const [topId, topCount] = [...byMember].sort((a, b) => b[1] - a[1])[0] ?? []
  const top = people.find((person) => person.id === topId)

  return (
    <section
      className="activity-heatmap"
      aria-labelledby="activity-heatmap-title"
      data-page-zone="section"
    >
      <header>
        <h2 id="activity-heatmap-title">
          <span className="activity-heatmap-total">{total}</span> tasks
          completed since {formatDate(start)}
        </h2>
        {busiest?.value ? (
          <dl className="activity-facts">
            <div>
              <dt>Busiest day</dt>
              <dd>
                {formatDate(busiest.date)} · {count(busiest.value)}
              </dd>
            </div>
            {top && topCount ? (
              <div>
                <dt>Most completed</dt>
                <dd>
                  <MemberAvatar member={top} size="sm" />
                  {top.name} · {count(topCount)}
                </dd>
              </div>
            ) : null}
            <div>
              <dt>Active days</dt>
              <dd>
                {days.filter((day) => day.value).length} of {days.length}
              </dd>
            </div>
          </dl>
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
