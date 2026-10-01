import { getRouteApi, Link } from "@tanstack/react-router"
import { buttonVariants } from "@/kit/ui/button"
import { defaultActivitySearch } from "./activity-search"
import { OverviewPage } from "@/features/overview/overview-page"
import { useDemoWorkspace } from "./workspace-context"
import { useRouteFocus } from "./use-route-focus"
import { reportPeriodOf, reportPeriodSearch } from "./report-period-search"
import { OverviewGettingStarted } from "./overview-getting-started"

const route = getRouteApi("/app/demo/overview")

export function OverviewRoute() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { demo, onNewProject, onSelectProject, results } = useDemoWorkspace()
  useRouteFocus()

  return (
    <>
      <title>{`Overview · ${demo.workspace.name}`}</title>
      <OverviewPage
        intro={<OverviewGettingStarted />}
        activityLink={
          <Link
            to="/app/demo/activity"
            search={defaultActivitySearch}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Show all activity
          </Link>
        }
        projectTableControl={{
          state: results.overviewTable,
          onChange: results.setOverviewTable,
        }}
        projects={demo.projects}
        activity={demo.activity}
        tasks={demo.tasks}
        members={demo.workspace.members}
        activityMembers={demo.workspace.people}
        referenceDate={demo.workspace.referenceDate}
        onNewProject={onNewProject}
        onSelectProject={onSelectProject}
        period={reportPeriodOf(search)}
        onPeriodChange={(next) => {
          void navigate({
            search: reportPeriodSearch(next, search.period),
            resetScroll: false,
          })
        }}
      />
    </>
  )
}
