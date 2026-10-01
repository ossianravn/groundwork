import type { CompletionGroup } from "@/demo/analytics"
import type { Activity, Member, Project, ProjectTask } from "@/demo/model"
import type { ReportWindow } from "@/demo/report-period"
import { ContributorBreakdown } from "./contributor-breakdown"
import { MemberCompareChart } from "./member-compare-chart"
import { MemberLoadChart } from "./member-load-chart"

/**
 * Workload: who has the work now, who did it in the period, and how two
 * people's work compares across kinds of project.
 */
export function WorkloadSection({
  activity,
  tasks,
  projects,
  people,
  members,
  range,
  contributors,
}: {
  /** Already scoped to the chosen project, if any. */
  activity: Activity[]
  tasks: ProjectTask[]
  projects: Project[]
  /** Everyone who appears in history, for credit. */
  people: Member[]
  /** Current members, who can hold work. */
  members: Member[]
  range: ReportWindow
  contributors: CompletionGroup[]
}) {
  return (
    <section className="analytics-section" aria-labelledby="analytics-workload">
      <header className="analytics-section-header">
        <h2 id="analytics-workload">Workload</h2>
        <p>Who has the work now, and who did it in the period.</p>
      </header>
      <MemberLoadChart tasks={tasks} projects={projects} members={members} />
      <div className="analytics-pair">
        <ContributorBreakdown rows={contributors} people={people} />
        <MemberCompareChart
          activity={activity}
          projects={projects}
          members={members}
          people={people}
          range={range}
        />
      </div>
    </section>
  )
}
