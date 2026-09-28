import { getRouteApi, Link } from "@tanstack/react-router"
import { buttonVariants } from "@/kit/ui/button"
import { defaultActivitySearch } from "./activity-search"
import { OverviewPage } from "@/features/overview/overview-page"
import { useDemoWorkspace } from "./workspace-context"
import { useRouteFocus } from "./use-route-focus"

const route = getRouteApi("/app/demo/overview")

export function OverviewRoute() {
  const { period } = route.useSearch()
  const navigate = route.useNavigate()
  const { demo, onNewProject, onSelectProject, results } = useDemoWorkspace()
  useRouteFocus()

  return (
    <>
      <title>{`Overview · ${demo.workspace.name}`}</title>
      <OverviewPage
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
        members={demo.workspace.members}
        activityMembers={demo.workspace.people}
        referenceDate={demo.workspace.referenceDate}
        onNewProject={onNewProject}
        onSelectProject={onSelectProject}
        period={period}
        onPeriodChange={(next) => {
          void navigate({ search: { period: next }, resetScroll: false })
        }}
      />
    </>
  )
}
