import type {
  PaginationState,
  SortingState,
  ColumnVisibilityState,
} from "@tanstack/react-table"
import { emptyProjectFilters, type ProjectFilters } from "./project-filtering"

export interface ProjectTableState {
  view: "table" | "grid" | "board" | "timeline"
  filters: ProjectFilters
  pagination: PaginationState
  sorting: SortingState
  columnVisibility: ColumnVisibilityState
}

export const initialProjectTableState: ProjectTableState = {
  view: "table",
  filters: emptyProjectFilters,
  pagination: { pageIndex: 0, pageSize: 5 },
  sorting: [],
  columnVisibility: {},
}

export function boundedProjectPage(
  pageIndex: number,
  pageSize: number,
  rowCount: number,
) {
  return Math.min(pageIndex, Math.max(0, Math.ceil(rowCount / pageSize) - 1))
}
