import { getRouteApi, Link } from "@tanstack/react-router"
import { buttonVariants } from "@/kit/ui/button"
import { defaultActivitySearch } from "./activity-search"
import { ProjectDetailLink } from "./project-detail-link"
import { defaultProjectsSearch } from "./projects-search"
import { OverviewPage } from "@/features/overview/overview-page"
import { useDemoWorkspace } from "./workspace-context"
import { useRouteFocus } from "./use-route-focus"
import { reportPeriodOf, reportPeriodSearch } from "./report-period-search"
import { OverviewGettingStarted } from "./overview-getting-started"

const route = getRouteApi("/app/demo/overview")

export function OverviewRoute() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { demo, onNewProject, onSelectProject } = useDemoWorkspace()
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
            All activity
          </Link>
        }
        projectsLink={
          <Link
            to="/app/demo/projects"
            search={defaultProjectsSearch}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            All projects
          </Link>
        }
        projects={demo.projects}
        activity={demo.activity}
        tasks={demo.tasks}
        members={demo.workspace.members}
        activityMembers={demo.workspace.people}
        referenceDate={demo.workspace.referenceDate}
        onNewProject={onNewProject}
        onSelectProject={onSelectProject}
        renderProject={(project, { children, ...props }) => (
          <ProjectDetailLink projectId={project.id} {...props}>
            {children}
          </ProjectDetailLink>
        )}
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
