import * as React from "react"
import { cn } from "cn"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table"

export interface ChartDataColumn<Row> {
  key: string
  header: React.ReactNode
  cell: (row: Row) => React.ReactNode
  /** Numbers align to the end so their digits line up. */
  numeric?: boolean
}

/**
 * The chart's values as a table, shown in its place by Show data. Every
 * value a chart draws is here, so nothing depends on hovering. The region
 * scrolls within the chart's height and takes keyboard focus to scroll.
 */
function ChartDataTable<Row>({
  label,
  columns,
  rows,
  rowKey,
  className,
}: {
  /** Names the region, such as "Daily task data". */
  label: string
  columns: ChartDataColumn<Row>[]
  rows: Row[]
  rowKey: (row: Row) => string
  className?: string
}) {
  return (
    <div
      data-slot="chart-data-table"
      tabIndex={0}
      role="region"
      aria-label={label}
      className={cn(
        "h-full min-h-64 w-full overflow-auto rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&_[data-slot=table-cell]]:py-(--row-padding)",
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                scope="col"
                className={cn(column.numeric && "text-right")}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={rowKey(row)}>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={cn(column.numeric && "text-right tabular-nums")}
                >
                  {column.cell(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export { ChartDataTable }
