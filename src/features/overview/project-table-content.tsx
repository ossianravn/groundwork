import type { CSSProperties, MouseEvent } from "react"
import { flexRender } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import type { DataTable } from "@/kit/data-table/table-features"
import { Button } from "@/kit/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/kit/ui/table"
import type { Project } from "@/demo/model"
import { projectColumnWidths } from "./project-columns"
import { ProjectRowMenu } from "./project-row-menu"

/** Row actions on right-click, long press or the context-menu key. */
export interface ProjectRowActions {
  onInspect: (id: string) => void
  onOpen: (id: string) => void
  selectable: boolean
}

export function ProjectTableContent({
  table,
  rowActions,
}: {
  table: DataTable<Project>
  rowActions?: ProjectRowActions
}) {
  const visibleColumns = table.getVisibleLeafColumns().map((column) => {
    // SAFETY: projectColumns requires every ID/accessor key to belong to the
    // width catalog. TanStack widens IDs to string; visibility only removes columns.
    const id = column.id as keyof typeof projectColumnWidths

    return { id, minWidth: projectColumnWidths[id] }
  })

  // The columns' minimum widths; stacked rows on phones need none.
  const width: CSSProperties & Record<"--project-table-width", string> = {
    "--project-table-width": `${visibleColumns.reduce((sum, column) => sum + column.minWidth, 0)}rem`,
  }

  return (
    <Table
      role="table"
      className="project-table"
      style={width}
      containerProps={{
        id: "project-table-scroll",
        tabIndex: 0,
        role: "region",
        "aria-label": "Projects, scroll horizontally for all columns",
      }}
    >
      <colgroup>
        {visibleColumns.map((column) => (
          <col
            key={column.id}
            style={
              column.id === "name"
                ? undefined
                : { width: `${column.minWidth}rem` }
            }
          />
        ))}
      </colgroup>
      <TableHeader role="rowgroup">
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id} role="row">
            {group.headers.map((header) => {
              const sort = header.column.getIsSorted()
              const label = String(header.column.columnDef.header)
              const nextSort = header.column.getNextSortingOrder()

              return (
                <TableHead
                  role="columnheader"
                  key={header.id}
                  scope="col"
                  aria-sort={
                    header.column.getCanSort()
                      ? sort === "asc"
                        ? "ascending"
                        : sort === "desc"
                          ? "descending"
                          : "none"
                      : undefined
                  }
                >
                  {header.column.getCanSort() ? (
                    <Button
                      variant="ghost"
                      className="table-sort"
                      onClick={header.column.getToggleSortingHandler()}
                      aria-label={`${label}: ${nextSort === "asc" ? "sort ascending" : nextSort === "desc" ? "sort descending" : "clear sorting"}`}
                    >
                      {label}
                      {sort === "asc" ? (
                        <ArrowUp aria-hidden="true" />
                      ) : sort === "desc" ? (
                        <ArrowDown aria-hidden="true" />
                      ) : (
                        <ArrowUpDown
                          aria-hidden="true"
                          className="table-sort-idle"
                        />
                      )}
                    </Button>
                  ) : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )
                  )}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody role="rowgroup">
        {table.getRowModel().rows.map((row) => {
          const state = row.getIsSelected() ? "selected" : undefined

          const cells = row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id} role="cell" data-column={cell.column.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))

          return rowActions ? (
            <ProjectRowMenu
              key={row.id}
              row={row}
              rowElement={
                <TableRow role="row" data-state={state} onClick={openRow} />
              }
              {...rowActions}
            >
              {cells}
            </ProjectRowMenu>
          ) : (
            <TableRow
              key={row.id}
              role="row"
              data-state={state}
              onClick={openRow}
            >
              {cells}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

// A plain click anywhere on a row opens its project, as its name does;
// controls in the row, modified clicks and text selection keep their own.
function openRow(event: MouseEvent<HTMLTableRowElement>) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    window.getSelection()?.toString() ||
    (event.target instanceof Element &&
      event.target.closest("a, button, input, label, [role=checkbox]"))
  )
    return

  event.currentTarget
    .querySelector<HTMLElement>("[data-quick-view-id]")
    ?.click()
}
