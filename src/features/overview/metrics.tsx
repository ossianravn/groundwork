import { CalendarClock, CheckCheck, FolderKanban, ListTodo } from "lucide-react"
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
      icon: FolderKanban,
    },
    {
      label: "Tasks remaining",
      value: summary.remaining,
      detail: "Across active projects",
      icon: ListTodo,
    },
    {
      label: "Due in 7 days",
      value: summary.due,
      detail: "From the snapshot date",
      icon: CalendarClock,
    },
    {
      label: "Completed projects",
      value: summary.completed,
      detail: "Across the workspace",
      icon: CheckCheck,
    },
  ]

  return (
    <section className="metrics-grid" aria-label="Workspace snapshot">
      {metrics.map(({ label, value, detail, icon: Icon }) => (
        <Card key={label} className="metric-card">
          <CardContent>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm text-muted-foreground">
                {label === "Due in 7 days" ? (
                  <TextHint description="Active projects due between the snapshot date and seven days after it. Overdue and completed projects are excluded.">
                    {label}
                  </TextHint>
                ) : (
                  label
                )}
              </h2>
              <Icon
                className="size-4 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <p className="metric-value">{value}</p>
            <p className="text-xs text-muted-foreground">{detail}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  )
}
