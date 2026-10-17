import { lazy, Suspense, type ReactNode } from "react"
import { Plus } from "lucide-react"
import { PageAction, PageActions } from "@/kit/shell/page-actions"
import { ChartState } from "@/kit/ui/chart-state"
import { snapshotHistory } from "@/demo/snapshot-history"
import {
  type Activity,
  type Member,
  type Project,
  type ProjectTask,
} from "@/demo/model"
import { reportWindow, type ReportPeriod } from "@/demo/report-period"
import { CompletionPeriod } from "./completion-period"
import { Metrics } from "./metrics"
import { ActivityList } from "./activity-list"
import { needsAttention } from "@/demo/attention"
import { NeedsAttention } from "./needs-attention"
import { projectButton, type ProjectLinkRenderer } from "./project-link"

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
  /** Names a project in the lists, such as a link to its page. */
  renderProject?: ProjectLinkRenderer
  activityLink?: ReactNode
  /** A link to the Projects page, after Needs attention. */
  projectsLink?: ReactNode
  /** Shown before the metrics, such as a getting-started checklist. */
  intro?: ReactNode
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
  renderProject = projectButton(onSelectProject),
  activityLink,
  projectsLink,
  intro,
}: OverviewPageProps) {
  return (
    <main
      id="main-content"
      className="page-content overview-page"
      tabIndex={-1}
    >
      <h1 className="sr-only">Overview</h1>
      <PageActions>
        <PageAction
          id="new-project"
          icon={Plus}
          label="New project"
          onClick={onNewProject}
        />
      </PageActions>
      {intro}
      <Metrics
        projects={projects}
        referenceDate={referenceDate}
        history={snapshotHistory(projects, tasks, activity, referenceDate)}
      />
      <div className="overview-middle" data-page-zone="section">
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
          activity={activity}
          projects={projects}
          members={activityMembers}
          renderProject={renderProject}
        />
      </div>
      <NeedsAttention
        items={needsAttention(projects, tasks, referenceDate)}
        members={members}
        renderProject={renderProject}
        allProjectsLink={projectsLink}
      />
    </main>
  )
}
