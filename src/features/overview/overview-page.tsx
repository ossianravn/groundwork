import { lazy, Suspense, type ReactNode } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/kit/ui/button"
import {
  formatDate,
  type Activity,
  type Member,
  type Period,
  type Project,
} from "@/demo/model"
import { CompletionPeriod } from "./completion-period"
import { Metrics } from "./metrics"
import { ActivityList } from "./activity-list"
import { ProjectsTable, type ProjectTableControl } from "./projects-table"

const CompletionChart = lazy(() =>
  import("./completion-chart").then((module) => ({
    default: module.CompletionChart,
  })),
)

export interface OverviewPageProps {
  projects: Project[]
  activity: Activity[]
  members: Member[]
  activityMembers?: Member[]
  referenceDate: string
  period: Period
  onPeriodChange: (period: Period) => void
  onNewProject: () => void
  onSelectProject: (id: string) => void
  projectTableControl?: ProjectTableControl
  activityLink?: ReactNode
  activityExpansion?: {
    expanded: boolean
    onChange: (expanded: boolean) => void
  }
}

export function OverviewPage({
  projects,
  activity,
  members,
  activityMembers = members,
  referenceDate,
  period,
  onPeriodChange,
  onNewProject,
  onSelectProject,
  projectTableControl,
  activityExpansion,
  activityLink,
}: OverviewPageProps) {
  return (
    <main id="main-content" className="page-content" tabIndex={-1}>
      <div className="page-heading">
        <h1>Overview</h1>
        <p>
          <span>Workspace snapshot</span>
          <span className="snapshot-separator" aria-hidden="true">
            {" "}
            ·{" "}
          </span>
          <time dateTime={referenceDate}>
            {formatDate(referenceDate, { year: "numeric" })}
          </time>
        </p>
        <Button id="new-project" onClick={onNewProject}>
          <Plus data-icon="inline-start" aria-hidden="true" />
          New project
        </Button>
      </div>
      <Metrics projects={projects} referenceDate={referenceDate} />
      <div className="overview-middle">
        <Suspense
          fallback={
            <section className="chart-loading" aria-busy="true">
              <h2>Task completion</h2>
              <p role="status">Loading chart…</p>
            </section>
          }
        >
          <CompletionChart
            activity={activity}
            referenceDate={referenceDate}
            period={period}
            periodControl={
              <CompletionPeriod period={period} onChange={onPeriodChange} />
            }
          />
        </Suspense>
        <ActivityList
          allActivityLink={activityLink}
          expansion={activityExpansion}
          activity={activity}
          projects={projects}
          members={activityMembers}
          onSelectProject={onSelectProject}
        />
      </div>
      <ProjectsTable
        onNewProject={onNewProject}
        control={projectTableControl}
        projects={projects}
        members={members}
        onSelect={onSelectProject}
      />
      <footer className="page-footer">
        <span>Demo data</span>
        <span>Built with shadcn/ui</span>
      </footer>
    </main>
  )
}
