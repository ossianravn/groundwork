import type { ReactNode } from "react"
import type { Activity, Member, Period, Project } from "@/demo/model"
import { completionBreakdown, type CompletionGroup } from "@/demo/analytics"
import { CompletionChart } from "@/features/overview/completion-chart"
import { CompletionPeriod } from "@/features/overview/completion-period"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/kit/ui/empty"
import { Button } from "@/kit/ui/button"
import { ProjectBreakdown } from "./project-breakdown"
import { ContributorBreakdown } from "./contributor-breakdown"

export function AnalyticsPage({
  activity,
  projects,
  people,
  referenceDate,
  period,
  projectId,
  onPeriodChange,
  onProjectChange,
  renderProject,
  projectView,
  onProjectViewChange,
}: {
  activity: Activity[]
  projects: Project[]
  people: Member[]
  referenceDate: string
  period: Period
  projectId: string
  onPeriodChange: (period: Period) => void
  onProjectChange: (id: string) => void
  renderProject: (row: CompletionGroup) => ReactNode
  projectView: "chart" | "data"
  onProjectViewChange: (view: "chart" | "data") => void
}) {
  const missing =
    !!projectId && !projects.some((project) => project.id === projectId)

  const data = completionBreakdown(
    activity,
    projects,
    people,
    referenceDate,
    period,
    projectId,
  )

  const options = [
    { value: "", label: "All projects" },
    ...projects.map((project) => ({ value: project.id, label: project.name })),
    ...(missing ? [{ value: projectId, label: "Project unavailable" }] : []),
  ]

  const filters = (
    <div className="analytics-filters">
      <Select
        items={options}
        value={projectId}
        onValueChange={(value) => {
          if (value !== null) onProjectChange(value)
        }}
      >
        <SelectTrigger aria-label="Analytics project">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <CompletionPeriod period={period} onChange={onPeriodChange} />
    </div>
  )

  return (
    <main
      className="page-content analytics-page"
      id="main-content"
      tabIndex={-1}
    >
      <h1 className="sr-only">Analytics</h1>
      {missing ? (
        <>
          <div className="analytics-heading">{filters}</div>
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Project unavailable</EmptyTitle>
              <EmptyDescription>
                Choose another project to view its completed work.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={() => onProjectChange("")}>
                All projects
              </Button>
            </EmptyContent>
          </Empty>
        </>
      ) : (
        <>
          <CompletionChart
            activity={data.activity}
            referenceDate={referenceDate}
            period={period}
            periodControl={filters}
          />
          <div className="analytics-breakdowns">
            <ProjectBreakdown
              rows={data.projects}
              colorFor={(row) => {
                const color = projects.find((item) => item.id === row.id)?.color

                return color ? `var(--hue-${color})` : "var(--chart-1)"
              }}
              renderName={renderProject}
              showData={projectView === "data"}
              onShowDataChange={(show) =>
                onProjectViewChange(show ? "data" : "chart")
              }
            />
            <ContributorBreakdown rows={data.contributors} people={people} />
          </div>
        </>
      )}
    </main>
  )
}
