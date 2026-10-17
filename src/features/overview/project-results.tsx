import type { CSSProperties, ReactNode } from "react"
import type { DataTable } from "@/kit/data-table/table-features"
import { Button } from "@/kit/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/kit/ui/empty"
import type { Member, Project } from "@/demo/model"
import { ProjectGrid } from "@/features/projects/project-grid"
import {
  ProjectTableContent,
  type ProjectRowActions,
} from "./project-table-content"
import type { ProjectTableState } from "./project-table-state"

type ProjectResultsStyle = CSSProperties & { "--project-row-count": number }

/** The current view of the filtered projects, or the no-results state. */
export function ProjectResults({
  table,
  view,
  rowCount,
  members,
  onSelect,
  renderName,
  renderCardName,
  renderBoard,
  renderTimeline,
  rowActions,
  onClearFilters,
  pageZone = false,
}: {
  table: DataTable<Project>
  view: ProjectTableState["view"]
  /** Visible rows before pagination; sizes the results for stable height. */
  rowCount: number
  members: Member[]
  onSelect: (id: string) => void
  renderName?: (project: Project) => ReactNode
  /** The name on a card, when it opens differently from a table row. */
  renderCardName?: (project: Project) => ReactNode
  renderBoard?: (table: DataTable<Project>) => ReactNode
  renderTimeline?: (
    table: DataTable<Project>,
    layout: "timeline" | "month",
  ) => ReactNode
  rowActions?: ProjectRowActions
  onClearFilters: () => void
  /** Marks the results as the page's content zone. */
  pageZone?: boolean
}) {
  const style: ProjectResultsStyle = {
    "--project-row-count": Math.min(rowCount, table.state.pagination.pageSize),
  }

  const empty = table.getPrePaginatedRowModel().rows.length === 0

  return (
    <div
      className="project-results"
      data-view={view}
      data-page-zone={pageZone ? "content" : undefined}
      style={style}
    >
      {view === "board" && renderBoard ? (
        renderBoard(table)
      ) : (view === "timeline" || view === "month") && renderTimeline ? (
        renderTimeline(table, view)
      ) : view === "grid" ? (
        <ProjectGrid
          table={table}
          members={members}
          onInspect={onSelect}
          renderName={renderCardName ?? renderName}
        />
      ) : (
        <ProjectTableContent table={table} rowActions={rowActions} />
      )}
      {empty && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No matching projects</EmptyTitle>
            <EmptyDescription>Adjust your search or filters.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={onClearFilters}>
              Clear filters
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  )
}
