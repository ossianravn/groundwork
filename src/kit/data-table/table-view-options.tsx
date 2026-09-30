import { useId } from "react"
import type { RowData } from "@tanstack/react-table"
import type { DataTable } from "./table-features"
import { Columns3 } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Checkbox } from "@/kit/ui/checkbox"
import { Field, FieldLabel } from "@/kit/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/kit/ui/popover"

export function TableViewOptions<T extends RowData>({
  table,
}: {
  table: DataTable<T>
}) {
  const id = useId()

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" className="table-view-options-trigger" />
        }
      >
        <Columns3 aria-hidden="true" />
        {/* Hosts may hide this visually in tight toolbars; it stays the name. */}
        <span className="table-view-options-label">Columns</span>
      </PopoverTrigger>
      <PopoverContent align="end" className="table-view-options">
        <PopoverTitle>Visible columns</PopoverTitle>
        {table
          .getAllLeafColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <Field
              key={column.id}
              orientation="horizontal"
              className="facet-option"
            >
              <Checkbox
                id={`${id}-${column.id}`}
                checked={column.getIsVisible()}
                onCheckedChange={(checked) => column.toggleVisibility(checked)}
              />
              <FieldLabel htmlFor={`${id}-${column.id}`}>
                {String(column.columnDef.header)}
              </FieldLabel>
            </Field>
          ))}
      </PopoverContent>
    </Popover>
  )
}
