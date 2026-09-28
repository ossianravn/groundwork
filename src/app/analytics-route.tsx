import { useNavigate, useSearch } from "@tanstack/react-router"
import { AnalyticsPage } from "@/features/analytics/analytics-page"
import { useDemoWorkspace } from "./workspace-context"
import { useRouteFocus } from "./use-route-focus"
import { ProjectDetailLink } from "./project-detail-link"

export function AnalyticsRoute() {
  const { demo } = useDemoWorkspace()
  const search = useSearch({ from: "/app/demo/analytics" })
  const navigate = useNavigate()
  useRouteFocus()

  return (
    <>
      <title>{`Analytics · ${demo.workspace.name}`}</title>
      <AnalyticsPage
        activity={demo.activity}
        projects={demo.projects}
        people={demo.workspace.people}
        referenceDate={demo.workspace.referenceDate}
        period={search.period}
        projectId={search.project}
        projectView={search.projectView}
        onProjectViewChange={(projectView) => {
          void navigate({
            to: "/app/demo/analytics",
            search: { ...search, projectView },
            resetScroll: false,
          })
        }}
        onPeriodChange={(period) => {
          void navigate({
            to: "/app/demo/analytics",
            search: { ...search, period },
            resetScroll: false,
          })
        }}
        onProjectChange={(project) => {
          void navigate({
            to: "/app/demo/analytics",
            search: { ...search, project },
            resetScroll: false,
          })
        }}
        renderProject={(row) =>
          demo.projects.some((project) => project.id === row.id) ? (
            <ProjectDetailLink
              projectId={row.id}
              id={`analytics-project-${row.id}`}
              className="analytics-project-link"
            >
              {row.name}
            </ProjectDetailLink>
          ) : (
            row.name
          )
        }
      />
    </>
  )
}
