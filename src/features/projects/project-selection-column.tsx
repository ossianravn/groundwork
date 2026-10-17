import type { ColumnDef } from "@tanstack/react-table"
import type { dataTableFeatures } from "@/kit/data-table/table-features"
import { Checkbox } from "@/kit/ui/checkbox"
import type { Project } from "@/demo/model"

export const projectSelectionColumn: ColumnDef<
  typeof dataTableFeatures,
  Project
> = {
  id: "selection",
  enableSorting: false,
  enableHiding: false,
  // The table selects its page from its header, like a mail list.
  header: ({ table }) => (
    <Checkbox
      aria-label={
        table.getIsSomePageRowsSelected() || table.getIsAllPageRowsSelected()
          ? "Clear project selection"
          : "Select all projects on this page"
      }
      checked={table.getIsAllPageRowsSelected()}
      indeterminate={table.getIsSomePageRowsSelected()}
      disabled={!table.getRowModel().rows.length}
      onCheckedChange={() =>
        table.getIsSomePageRowsSelected() || table.getIsAllPageRowsSelected()
          ? table.resetRowSelection(true)
          : table.toggleAllPageRowsSelected(true)
      }
    />
  ),
  cell: ({ row }) => (
    <Checkbox
      aria-label={`Select ${row.original.name}`}
      checked={row.getIsSelected()}
      onCheckedChange={(checked) => row.toggleSelected(checked)}
    />
  ),
}
