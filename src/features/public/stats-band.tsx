import { ArrowUpRight } from "lucide-react"
import type { PublicLinkComponent } from "@/components/public-link"
import { initialProjects } from "@/demo/project-fixtures"
import { initialTasks } from "@/demo/project-tasks"
import { initialActivity } from "@/demo/activity-fixtures"
import { completionSeries } from "@/demo/selectors"
import { reportWindow } from "@/demo/report-period"
import workspace from "@/demo/data/workspace.json"

// The sample workspace in figures (MKT-23), read from the same records the
// demo opens with, so the numbers match what visitors find inside.
const completed = completionSeries(
  initialActivity,
  reportWindow(workspace.referenceDate, { kind: "preset", days: 14 }),
).reduce((sum, day) => sum + day.completed, 0)

const stats = [
  { value: initialTasks.length, label: "tasks tracked" },
  { value: completed, label: "completed in two weeks" },
  { value: initialProjects.length, label: "projects in flight" },
  { value: workspace.members.length, label: "people on the team" },
]

export function StatsBand({
  LinkComponent,
}: {
  LinkComponent: PublicLinkComponent
}) {
  return (
    <section
      className="stats-band public-container"
      aria-labelledby="stats-title"
    >
      <div className="stats-band-heading">
        <h2 id="stats-title">One sample workspace, in numbers.</h2>
        <p>
          Figures from Studio North, the workspace the demo opens with.{" "}
          <LinkComponent destination="demo">
            See it for yourself
            <ArrowUpRight aria-hidden="true" />
          </LinkComponent>
        </p>
      </div>
      <dl className="stats-band-figures">
        {stats.map((stat) => (
          <div key={stat.label}>
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
