import type { RowData } from "@tanstack/react-table"
import type { DataTable } from "./table-features"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Button } from "@/kit/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"

const pageSizes = [5, 10, 20].map((size) => ({
  value: String(size),
  label: String(size),
}))

export function TablePagination<T extends RowData>({
  table,
  totalCount,
  itemLabel,
  pageSizeLabel = "Rows",
}: {
  table: DataTable<T>
  totalCount: number
  itemLabel: string
  pageSizeLabel?: string
}) {
  const pageSizeLabelId = useId()
  const { pageIndex, pageSize } = table.state.pagination
  const filteredCount = table.getPrePaginatedRowModel().rows.length
  const pageCount = table.getPageCount()
  const start = filteredCount ? pageIndex * pageSize + 1 : 0
  const end = Math.min((pageIndex + 1) * pageSize, filteredCount)

  return (
    <div className="table-pagination">
      <p className="table-range" role="status">
        {filteredCount
          ? `${start}–${end} of ${filteredCount} ${itemLabel}`
          : `No matching ${itemLabel}`}
        {filteredCount !== totalCount && ` (${totalCount} total)`}
      </p>
      <div className="table-page-size">
        <span id={pageSizeLabelId}>
          {pageSizeLabel}
          <span className="table-page-size-detail"> per page</span>
        </span>
        <Select
          items={pageSizes}
          value={String(pageSize)}
          onValueChange={(value) => {
            if (value) table.setPageSize(Number(value))
          }}
        >
          <SelectTrigger size="sm" aria-labelledby={pageSizeLabelId}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {pageSizes.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {/* One page needs no page controls; the range above says it all. */}
      {pageCount > 1 && (
        <nav
          aria-label={`${itemLabel} pagination`}
          className="table-page-buttons"
        >
          <span className="table-page-number">
            {pageCount ? `Page ${pageIndex + 1} of ${pageCount}` : "No pages"}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="First page"
            className="table-page-edge"
            disabled={!table.getCanPreviousPage()}
            focusableWhenDisabled
            onClick={() => table.firstPage()}
          >
            <ChevronsLeft aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous page"
            className="table-page-previous"
            disabled={!table.getCanPreviousPage()}
            focusableWhenDisabled
            onClick={() => table.previousPage()}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Next page"
            disabled={!table.getCanNextPage()}
            focusableWhenDisabled
            onClick={() => table.nextPage()}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Last page"
            className="table-page-edge"
            disabled={!table.getCanNextPage()}
            focusableWhenDisabled
            onClick={() => table.lastPage()}
          >
            <ChevronsRight aria-hidden="true" />
          </Button>
        </nav>
      )}
    </div>
  )
}

import { useId } from "react"
