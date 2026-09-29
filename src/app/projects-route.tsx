import { useCallback, useEffect } from "react"
import { getRouteApi } from "@tanstack/react-router"
import { Plus } from "lucide-react"
import type { Project } from "@/demo/model"
import { buttonVariants } from "@/kit/ui/button"
import { PageAction, PageActions } from "@/kit/shell/page-actions"
import { ProjectsTableView } from "@/features/overview/projects-table"
import { filterProjects } from "@/features/overview/project-filtering"
import { boundedProjectPage } from "@/features/overview/project-table-state"
import { useDemoWorkspace } from "./workspace-context"
import { projectTableSearch, projectTableState } from "./projects-search"
import { useRouteFocus } from "./use-route-focus"
import { ProjectDetailLink } from "./project-detail-link"
import { ProjectSavedViews } from "./project-saved-views"
import { ProjectBulkActions } from "@/features/projects/project-bulk-actions"
import { ProjectBoard } from "@/features/projects/project-board"
import { ProjectTimelineView } from "@/features/projects/project-timeline-view"
import type { ProjectBulkHandler } from "@/demo/project-bulk"
import { mergeBoardOrder } from "@/features/projects/board-order"

const route = getRouteApi("/app/demo/projects")

export function ProjectsRoute() {
  const search = route.useSearch()
  const navigate = route.useNavigate()

  const { demo, onNewProject, onSelectProject, results } = useDemoWorkspace()

  const state = {
    ...projectTableState(search),
    columnVisibility: results.projectColumns,
  }

  const count = filterProjects(demo.projects, state.filters).rows.length
  const page = boundedProjectPage(search.page - 1, search.pageSize, count) + 1
  useRouteFocus()

  const applyChange: ProjectBulkHandler = (ids, action, retry) => {
    const { result, undo } = demo.bulkChangeProjects(
      ids,
      action,
      !retry && search.bulkScenario === "partial-failure",
    )

    return {
      ...result,
      undo: undo ? () => demo.undoProjectChange(undo) : undefined,
    }
  }

  const renderName = useCallback(
    (project: Project) => (
      <ProjectDetailLink
        projectId={project.id}
        id={`project-link-${project.id}`}
        title={project.name}
        className={buttonVariants({
          variant: "ghost",
          className: "project-name",
        })}
      >
        <span className="truncate">{project.name}</span>
      </ProjectDetailLink>
    ),
    [],
  )

  useEffect(() => {
    if (page !== search.page) {
      void navigate({
        search: (previous) => ({ ...previous, page }),
        replace: true,
        resetScroll: false,
      })
    }
  }, [page, search.page, navigate])

  return (
    <main id="main-content" className="page-content" tabIndex={-1}>
      <title>{`Projects · ${demo.workspace.name}`}</title>
      <h1 className="sr-only">Projects</h1>
      <PageActions>
        <PageAction
          id="new-project"
          icon={Plus}
          label="New project"
          onClick={onNewProject}
        />
      </PageActions>
      <ProjectsTableView
        onNewProject={onNewProject}
        projects={demo.projects}
        members={demo.workspace.members}
        onSelect={onSelectProject}
        state={state}
        heading="All projects"
        surface="plain"
        allowViewSwitch
        allowAdvanced
        savedViews={<ProjectSavedViews search={search} />}
        renderBoard={(table) => (
          <ProjectBoard
            table={table}
            members={demo.workspace.members}
            onInspect={onSelectProject}
            renderName={renderName}
            onApply={applyChange}
            order={results.boardOrder}
            onOrderChange={(visible) =>
              results.setBoardOrder((current) =>
                mergeBoardOrder(
                  current,
                  demo.projects.map((project) => project.id),
                  visible,
                ),
              )
            }
          />
        )}
        renderTimeline={(table) => (
          <ProjectTimelineView
            projects={table
              .getPrePaginatedRowModel()
              .rows.map((row) => row.original)}
            activity={demo.activity}
            referenceDate={demo.workspace.referenceDate}
            renderName={(project) => (
              <ProjectDetailLink
                projectId={project.id}
                className="timeline-link"
              >
                {project.name}
              </ProjectDetailLink>
            )}
          />
        )}
        renderSelection={(table) => (
          <ProjectBulkActions
            table={table}
            members={demo.workspace.members}
            onApply={applyChange}
          />
        )}
        onChange={(next) => {
          results.setProjectColumns(next.columnVisibility)

          if (next.columnVisibility !== state.columnVisibility) return
          void navigate({
            search: (previous) => ({
              ...previous,
              ...projectTableSearch(next),
            }),
            replace: next.filters.query !== state.filters.query,
            resetScroll: false,
          })
        }}
        renderName={renderName}
      />
    </main>
  )
}
