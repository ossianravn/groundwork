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
import { ProjectTableContent } from "./project-table-content"
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
  renderBoard,
  renderTimeline,
  onClearFilters,
}: {
  table: DataTable<Project>
  view: ProjectTableState["view"]
  /** Visible rows before pagination; sizes the results for stable height. */
  rowCount: number
  members: Member[]
  onSelect: (id: string) => void
  renderName?: (project: Project) => ReactNode
  renderBoard?: (table: DataTable<Project>) => ReactNode
  renderTimeline?: (table: DataTable<Project>) => ReactNode
  onClearFilters: () => void
}) {
  const style: ProjectResultsStyle = {
    "--project-row-count": Math.min(rowCount, table.state.pagination.pageSize),
  }

  const empty = table.getPrePaginatedRowModel().rows.length === 0

  return (
    <div className="project-results" data-view={view} style={style}>
      {view === "board" && renderBoard ? (
        renderBoard(table)
      ) : view === "timeline" && renderTimeline ? (
        renderTimeline(table)
      ) : view === "grid" ? (
        <ProjectGrid
          table={table}
          members={members}
          onInspect={onSelect}
          renderName={renderName}
        />
      ) : (
        <ProjectTableContent table={table} />
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
