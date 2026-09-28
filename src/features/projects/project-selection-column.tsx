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
  header: () => <span className="sr-only">Selection</span>,
  cell: ({ row }) => (
    <Checkbox
      aria-label={`Select ${row.original.name}`}
      checked={row.getIsSelected()}
      onCheckedChange={(checked) => row.toggleSelected(checked)}
    />
  ),
}
