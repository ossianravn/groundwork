import {
  bucketOf,
  deliverySeries,
  deliveryTotals,
  previousWindow,
} from "@/demo/delivery"
import { formatDate, type Activity, type ProjectTask } from "@/demo/model"
import { windowDates, type ReportWindow } from "@/demo/report-period"
import { CycleTimeChart } from "./cycle-time-chart"
import { NetChangeChart } from "./net-change-chart"
import { ThroughputChart } from "./throughput-chart"

// Stable formatters, so the charts' label measurements are not redone.
const weekLabel = (date: string) => `w/c ${formatDate(date)}`

const formatDay = (date: string) => formatDate(date)

/**
 * Delivery: is work finished as fast as it arrives? Tasks completed and
 * added, the change in open work, and how long tasks take, over the shared
 * period. Ranges over a month read by week. Comparison adds the previous
 * period of the same length.
 */
export function DeliverySection({
  activity,
  tasks,
  range,
  comparison: requested,
  historyStart,
}: {
  /** Already scoped to the chosen project, if any. */
  activity: Activity[]
  tasks: ProjectTask[]
  range: ReportWindow
  /** "previous 30 days" while comparing; absent otherwise. */
  comparison?: string
  /** The first day of recorded history; earlier periods can't compare. */
  historyStart: string
}) {
  const bucket = bucketOf(range)
  const points = deliverySeries(activity, tasks, range, bucket)
  const totals = deliveryTotals(activity, tasks, range)
  const before = previousWindow(range)

  // A period that starts before the history would compare with nothing.
  const unavailable = !!requested && before.start < historyStart
  const comparison = unavailable ? undefined : requested

  const previous = comparison
    ? deliverySeries(activity, tasks, before, bucket)
    : undefined

  const previousTotals = comparison
    ? deliveryTotals(activity, tasks, before)
    : undefined

  // Medians of a day's few tasks swing wildly, so cycle time reads by week
  // once the period spans more than two weeks.
  const cycleBucket = windowDates(range).length > 14 ? "week" : bucket

  const cyclePoints =
    cycleBucket === bucket
      ? points
      : deliverySeries(activity, tasks, range, cycleBucket)

  const dateLabel = bucket === "week" ? weekLabel : formatDay

  return (
    <section className="analytics-section" aria-labelledby="analytics-delivery">
      <header className="analytics-section-header">
        <h2 id="analytics-delivery">Delivery</h2>
        <p>
          How fast work arrives and gets done
          {bucket === "week" ? ", by week" : ", by day"}.
          {unavailable &&
            ` No history before ${formatDate(historyStart, { year: "numeric" })} to compare with; choose a shorter period.`}
        </p>
      </header>
      <ThroughputChart
        points={points}
        previous={previous}
        totals={{ ...totals, previousCompleted: previousTotals?.completed }}
        comparison={comparison}
        dateLabel={dateLabel}
      />
      <div className="analytics-pair">
        <NetChangeChart
          points={points}
          net={totals.net}
          previousNet={previousTotals?.net}
          comparison={comparison}
          dateLabel={dateLabel}
        />
        <CycleTimeChart
          points={cyclePoints}
          cycle={totals.cycle}
          previousCycle={previousTotals?.cycle}
          comparison={comparison}
          dateLabel={cycleBucket === "week" ? weekLabel : dateLabel}
        />
      </div>
    </section>
  )
}
