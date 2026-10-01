import type { ReactNode } from "react"
import type { Activity, Member, Project, ProjectTask } from "@/demo/model"
import { reportWindow, type ReportPeriod } from "@/demo/report-period"
import { completionBreakdown, type CompletionGroup } from "@/demo/analytics"
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
import { Switch } from "@/kit/ui/switch"
import { DeliverySection } from "./delivery-section"
import { ProjectsSection } from "./projects-section"
import { WorkloadSection } from "./workload-section"
import { previousWindow } from "@/demo/delivery"

export function AnalyticsPage({
  activity,
  tasks,
  projects,
  people,
  members,
  referenceDate,
  period,
  projectId,
  onPeriodChange,
  onProjectChange,
  renderProject,
  projectView,
  onProjectViewChange,
  compare,
  onCompareChange,
}: {
  activity: Activity[]
  tasks: ProjectTask[]
  projects: Project[]
  people: Member[]
  /** Current members, who can hold open work. */
  members: Member[]
  referenceDate: string
  period: ReportPeriod
  projectId: string
  onPeriodChange: (period: ReportPeriod) => void
  onProjectChange: (id: string) => void
  renderProject: (row: CompletionGroup) => ReactNode
  projectView: "chart" | "data"
  onProjectViewChange: (view: "chart" | "data") => void
  /** Adds the previous period of the same length to Delivery. */
  compare: boolean
  onCompareChange: (compare: boolean) => void
}) {
  const range = reportWindow(referenceDate, period)

  const missing =
    !!projectId && !projects.some((project) => project.id === projectId)

  const data = completionBreakdown(activity, projects, people, range, projectId)

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
      <CompletionPeriod
        period={period}
        referenceDate={referenceDate}
        onChange={onPeriodChange}
      />
      <label className="analytics-compare">
        <Switch
          size="sm"
          checked={compare}
          onCheckedChange={onCompareChange}
          disabled={missing}
        />
        Compare with previous period
      </label>
    </div>
  )

  const comparison = !compare
    ? undefined
    : period.kind === "preset"
      ? `previous ${period.days} days`
      : "previous period"

  // Comparison needs the whole previous period inside recorded history.
  const historyStart = [
    ...activity.map((event) => event.date),
    ...tasks.map((task) => task.createdAt),
  ].reduce((first, date) => (date < first ? date : first), referenceDate)

  const before = previousWindow(range)
  const comparable = before.start >= historyStart

  // Delivery reads before the period too (comparison), so it scopes by
  // project only and windows the records itself.
  const inProject = <T extends { projectId: string }>(items: T[]) =>
    projectId ? items.filter((item) => item.projectId === projectId) : items

  return (
    <main
      className="page-content analytics-page"
      id="main-content"
      tabIndex={-1}
    >
      <h1 className="sr-only">Analytics</h1>
      <div className="analytics-toolbar">{filters}</div>
      {missing ? (
        <>
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
          <DeliverySection
            activity={inProject(activity)}
            tasks={inProject(tasks)}
            range={range}
            comparison={comparison}
            historyStart={historyStart}
          />
          <ProjectsSection
            projects={projects}
            tasks={inProject(tasks)}
            projectId={projectId}
            range={range}
            referenceDate={referenceDate}
            completed={data.projects}
            previous={
              comparable && comparison
                ? {
                    label: comparison,
                    counts: Object.fromEntries(
                      completionBreakdown(
                        activity,
                        projects,
                        people,
                        before,
                        projectId,
                      ).projects.map((row) => [row.id, row.completed]),
                    ),
                  }
                : undefined
            }
            renderProject={renderProject}
            showData={projectView === "data"}
            onShowDataChange={(show) =>
              onProjectViewChange(show ? "data" : "chart")
            }
          />
          <WorkloadSection
            activity={inProject(activity)}
            tasks={inProject(tasks)}
            projects={projects}
            people={people}
            members={members}
            range={range}
            contributors={data.contributors}
          />
        </>
      )}
    </main>
  )
}
