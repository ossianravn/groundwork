import { Card, CardContent } from "@/kit/ui/card"
import { projectSummary } from "@/demo/selectors"
import type { Project } from "@/demo/model"
import type { snapshotHistory } from "@/demo/snapshot-history"
import { Sparkline } from "@/kit/ui/sparkline"
import { trendLabel } from "@/kit/ui/sparkline-label"
import { TextHint } from "@/kit/ui/text-hint"

type History = ReturnType<typeof snapshotHistory>

export function Metrics({
  projects,
  referenceDate,
  history,
}: {
  projects: Project[]
  referenceDate: string
  /** Each figure over the last 30 days, oldest first, for its sparkline. */
  history?: History
}) {
  const summary = projectSummary(projects, referenceDate)

  const metrics = [
    {
      label: "Active projects",
      key: "active",
      value: summary.active,
      detail: "In progress or in review",
    },
    {
      label: "Tasks remaining",
      key: "remaining",
      value: summary.remaining,
      detail: "Across active projects",
    },
    {
      label: "Due in 7 days",
      key: "due",
      value: summary.due,
      detail: "From the snapshot date",
    },
    {
      label: "Completed projects",
      key: "completed",
      value: summary.completed,
      detail: "Across the workspace",
    },
  ] as const

  return (
    <section className="metrics-grid" aria-label="Workspace snapshot">
      {metrics.map(({ label, key, value, detail }) => (
        <Card key={label} className="metric-card">
          <CardContent>
            <h2 className="text-xs font-medium text-muted-foreground">
              {label === "Due in 7 days" ? (
                <TextHint description="Active projects due between the snapshot date and seven days after it. Overdue and completed projects are excluded.">
                  {label}
                </TextHint>
              ) : (
                label
              )}
            </h2>
            <div className="metric-figure">
              <p className="metric-value">{value}</p>
              {history && (
                <Sparkline
                  className="metric-trend"
                  values={history.map((day) => day[key])}
                  label={`${label}: ${trendLabel(
                    history.map((day) => day[key]),
                    "30 days",
                  )}`}
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{detail}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
