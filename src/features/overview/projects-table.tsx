import {
  dataTableFeatures,
  type DataTable,
} from "@/kit/data-table/table-features"
import {
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"
import {
  functionalUpdate,
  useTable,
  type RowSelectionState,
} from "@tanstack/react-table"
import { Button } from "@/kit/ui/button"
import { Card, CardHeader, CardTitle } from "@/kit/ui/card"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/kit/ui/empty"
import { TablePagination } from "@/kit/data-table/table-pagination"
import { TableViewOptions } from "@/kit/data-table/table-view-options"
import type { Member, Project } from "@/demo/model"
import { emptyProjectFilters, filterProjects } from "./project-filtering"
import { ProjectToolbar } from "./project-toolbar"
import { projectColumns } from "./project-columns"
import {
  boundedProjectPage,
  initialProjectTableState,
  type ProjectTableState,
} from "./project-table-state"

import { ProjectTableContent } from "./project-table-content"
import { projectSelectionColumn } from "@/features/projects/project-selection-column"
import { ProjectViewToggle } from "@/features/projects/project-view-toggle"
import { ProjectGrid } from "@/features/projects/project-grid"
import { ProjectGridControls } from "@/features/projects/project-grid-controls"
import { ProjectSelectionMenu } from "@/features/projects/project-selection-menu"
import { EmptyProjects } from "@/features/projects/empty-projects"

type ProjectResultsStyle = CSSProperties & { "--project-row-count": number }

interface ProjectsTableProps {
  projects: Project[]
  members: Member[]
  onSelect: (id: string) => void
  onNewProject: () => void
}

export interface ProjectTableControl {
  state: ProjectTableState
  onChange: (state: ProjectTableState) => void
}

export function ProjectsTable({
  control,
  ...props
}: ProjectsTableProps & { control?: ProjectTableControl }) {
  const [state, onChange] = useState(initialProjectTableState)

  return <ProjectsTableView {...props} {...(control ?? { state, onChange })} />
}

export function ProjectsTableView({
  projects,
  onNewProject,
  members,
  onSelect,
  state,
  onChange,
  renderName,
  heading = "Projects",
  renderSelection,
  renderBoard,
  allowViewSwitch = false,
  allowAdvanced = false,
  surface = "card",
}: ProjectsTableProps & {
  state: ProjectTableState
  onChange: (state: ProjectTableState) => void
  renderName?: (project: Project) => ReactNode
  heading?: string
  renderSelection?: (table: DataTable<Project>) => ReactNode
  renderBoard?: (table: DataTable<Project>) => ReactNode
  allowViewSwitch?: boolean
  allowAdvanced?: boolean
  /** A plain view sits on the page canvas; its heading is for assistive tech. */
  surface?: "card" | "plain"
}) {
  const { filters } = state
  const filterKey = JSON.stringify(filters)

  const [selection, setSelection] = useState<{
    key: string
    rows: RowSelectionState
  }>({ key: filterKey, rows: {} })

  const rowSelection = selection.key === filterKey ? selection.rows : {}

  if (selection.key !== filterKey) {
    setSelection({ key: filterKey, rows: {} })
  }

  function setFilters(next: typeof filters) {
    setSelection({ key: JSON.stringify(next), rows: {} })
    onChange({
      ...state,
      filters: next,
      pagination: { ...state.pagination, pageIndex: 0 },
    })
  }

  const searchRef = useRef<HTMLInputElement>(null)

  const { rows, statusCounts, ownerCounts } = useMemo(
    () => filterProjects(projects, filters),
    [projects, filters],
  )

  const columns = useMemo(
    () => [
      ...(renderSelection ? [projectSelectionColumn] : []),
      ...projectColumns(members, onSelect, renderName),
    ],
    [members, onSelect, renderName, renderSelection],
  )

  const pagination = {
    ...state.pagination,
    pageIndex: boundedProjectPage(
      state.pagination.pageIndex,
      state.pagination.pageSize,
      rows.length,
    ),
  }

  const table = useTable({
    data: rows,
    columns,
    getRowId: (project) => project.id,
    features: dataTableFeatures,

    state: {
      pagination,
      sorting: state.sorting,
      columnVisibility: state.columnVisibility,
      rowSelection,
    },
    enableRowSelection: !!renderSelection,
    enableRowRangeSelection: false,
    onRowSelectionChange: (updater) =>
      setSelection({
        key: filterKey,
        rows: functionalUpdate(updater, rowSelection),
      }),
    onColumnVisibilityChange: (updater) =>
      onChange({
        ...state,
        columnVisibility: functionalUpdate(updater, state.columnVisibility),
      }),
    onPaginationChange: (updater) =>
      onChange({ ...state, pagination: functionalUpdate(updater, pagination) }),
    onSortingChange: (updater) =>
      onChange({
        ...state,
        sorting: functionalUpdate(updater, state.sorting),
        pagination: { ...pagination, pageIndex: 0 },
      }),
    autoResetPageIndex: false,
    manualPagination: state.view === "board",
    enableMultiSort: false,
    sortDescFirst: false,
  })

  const resultsStyle: ProjectResultsStyle = {
    "--project-row-count": Math.min(
      projects.length,
      table.state.pagination.pageSize,
    ),
  }

  if (projects.length === 0) return <EmptyProjects onCreate={onNewProject} />

  return (
    <Card
      id="projects"
      role="region"
      aria-labelledby="projects-heading"
      tabIndex={-1}
      className="projects-card"
      data-surface={surface}
    >
      <CardHeader className="project-card-header">
        {surface === "plain" ? (
          <h2 id="projects-heading" className="sr-only">
            {heading}
          </h2>
        ) : (
          <div className="flex items-center gap-2.5">
            <CardTitle>
              <h2 id="projects-heading">{heading}</h2>
            </CardTitle>
            <span className="count-chip">{projects.length}</span>
          </div>
        )}
        <div className="project-view-controls">
          {allowViewSwitch && (
            <ProjectViewToggle
              value={state.view}
              onChange={(view) => onChange({ ...state, view })}
            />
          )}
          {state.view === "table" && <TableViewOptions table={table} />}
        </div>
        <div
          className="project-results-toolbar"
          data-selectable={!!renderSelection}
        >
          {renderSelection && (
            <ProjectSelectionMenu
              table={table}
              scope={state.view === "board" ? "board" : "page"}
            />
          )}
          {!Object.values(rowSelection).some(Boolean) && (
            <ProjectToolbar
              searchRef={searchRef}
              filters={filters}
              allowAdvanced={allowAdvanced}
              onChange={setFilters}
              members={members}
              statusCounts={statusCounts}
              ownerCounts={ownerCounts}
            >
              {state.view !== "table" && (
                <ProjectGridControls
                  table={table}
                  board={state.view === "board"}
                />
              )}
            </ProjectToolbar>
          )}
          {renderSelection?.(table)}
        </div>
      </CardHeader>
      <div
        className="project-results"
        data-view={state.view}
        style={resultsStyle}
      >
        {state.view === "board" && renderBoard ? (
          renderBoard(table)
        ) : state.view === "grid" ? (
          <ProjectGrid
            table={table}
            members={members}
            onInspect={onSelect}
            renderName={renderName}
          />
        ) : (
          <ProjectTableContent table={table} />
        )}
        {rows.length === 0 && (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No matching projects</EmptyTitle>
              <EmptyDescription>
                Adjust your search or filters.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="outline"
                onClick={() => {
                  setFilters(emptyProjectFilters)
                  searchRef.current?.focus()
                }}
              >
                Clear filters
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </div>
      {state.view !== "board" && (
        <TablePagination
          table={table}
          totalCount={projects.length}
          itemLabel="projects"
          pageSizeLabel={state.view === "grid" ? "Cards" : "Rows"}
        />
      )}
    </Card>
  )
}
