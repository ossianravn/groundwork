import { lazy, Suspense, type ReactNode } from "react"
import { Plus } from "lucide-react"
import { PageAction, PageActions } from "@/kit/shell/page-actions"
import { ChartState } from "@/kit/ui/chart-state"
import {
  formatDate,
  type Activity,
  type Member,
  type Project,
  type ProjectTask,
} from "@/demo/model"
import { reportWindow, type ReportPeriod } from "@/demo/report-period"
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
  /** Every task, for tasks added per day. */
  tasks: ProjectTask[]
  members: Member[]
  activityMembers?: Member[]
  referenceDate: string
  period: ReportPeriod
  onPeriodChange: (period: ReportPeriod) => void
  onNewProject: () => void
  onSelectProject: (id: string) => void
  projectTableControl?: ProjectTableControl
  activityLink?: ReactNode
  /** Shown before the metrics, such as a getting-started checklist. */
  intro?: ReactNode
  activityExpansion?: {
    expanded: boolean
    onChange: (expanded: boolean) => void
  }
}

export function OverviewPage({
  projects,
  activity,
  tasks,
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
  intro,
}: OverviewPageProps) {
  return (
    <main id="main-content" className="page-content" tabIndex={-1}>
      <h1 className="sr-only">Overview</h1>
      <PageActions
        meta={
          <>
            Snapshot{" "}
            <time dateTime={referenceDate}>
              {formatDate(referenceDate, { year: "numeric" })}
            </time>
          </>
        }
      >
        <PageAction
          id="new-project"
          icon={Plus}
          label="New project"
          onClick={onNewProject}
        />
      </PageActions>
      {intro}
      <Metrics projects={projects} referenceDate={referenceDate} />
      <div className="overview-middle">
        <Suspense
          fallback={
            <section className="chart-loading" aria-busy="true">
              <h2>Tasks completed and added</h2>
              <ChartState status="loading" />
            </section>
          }
        >
          <CompletionChart
            activity={activity}
            tasks={tasks}
            range={reportWindow(referenceDate, period)}
            snapshotDate={referenceDate}
            periodControl={
              <CompletionPeriod
                period={period}
                referenceDate={referenceDate}
                onChange={onPeriodChange}
              />
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
    </main>
  )
}
