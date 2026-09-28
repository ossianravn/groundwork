import { Card, CardContent } from "@/kit/ui/card"
import { projectSummary } from "@/demo/selectors"
import type { Project } from "@/demo/model"
import { TextHint } from "@/kit/ui/text-hint"

export function Metrics({
  projects,
  referenceDate,
}: {
  projects: Project[]
  referenceDate: string
}) {
  const summary = projectSummary(projects, referenceDate)

  const metrics = [
    {
      label: "Active projects",
      value: summary.active,
      detail: "In progress or in review",
    },
    {
      label: "Tasks remaining",
      value: summary.remaining,
      detail: "Across active projects",
    },
    {
      label: "Due in 7 days",
      value: summary.due,
      detail: "From the snapshot date",
    },
    {
      label: "Completed projects",
      value: summary.completed,
      detail: "Across the workspace",
    },
  ]

  return (
    <section className="metrics-grid" aria-label="Workspace snapshot">
      {metrics.map(({ label, value, detail }) => (
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
            <p className="metric-value">{value}</p>
            <p className="text-xs text-muted-foreground">{detail}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
