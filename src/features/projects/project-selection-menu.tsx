import { useState } from "react"
import { ChevronDown } from "lucide-react"
import type { DataTable } from "@/kit/data-table/table-features"
import { Button } from "@/kit/ui/button"
import { Checkbox } from "@/kit/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/kit/ui/popover"
import type { Project } from "@/demo/model"

export function ProjectSelectionMenu({
  table,
  scope = "page",
}: {
  table: DataTable<Project>
  scope?: "page" | "board"
}) {
  const [open, setOpen] = useState(false)
  const rows = table.getPrePaginatedRowModel().rows
  const selectedCount = rows.filter((row) => row.getIsSelected()).length
  const pageCount = table.getRowModel().rows.length

  function select(all: boolean) {
    setOpen(false)

    if (all) table.toggleAllRowsSelected(true)
    else table.toggleAllPageRowsSelected(true)
    requestAnimationFrame(() =>
      document.getElementById("project-selection-trigger")?.focus(),
    )
  }

  return (
    <div
      className="project-selection-control"
      role="group"
      aria-label="Project selection"
    >
      <label className="project-selection-checkbox">
        <Checkbox
          aria-label={
            selectedCount
              ? "Clear project selection"
              : `Select all ${pageCount} ${pageCount === 1 ? "project" : "projects"} on this ${scope}`
          }
          checked={rows.length > 0 && selectedCount === rows.length}
          indeterminate={selectedCount > 0 && selectedCount < rows.length}
          disabled={rows.length === 0}
          onCheckedChange={() => {
            if (selectedCount) table.resetRowSelection(true)
            else table.toggleAllPageRowsSelected(true)
          }}
        />
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={<Button variant="ghost" />}
          id="project-selection-trigger"
          aria-label={
            selectedCount
              ? `${selectedCount} ${selectedCount === 1 ? "project" : "projects"} selected; selection options`
              : "Project selection options"
          }
          disabled={rows.length === 0}
        >
          {selectedCount ? `${selectedCount} selected` : "Select"}
          <ChevronDown aria-hidden="true" data-icon="inline-end" />
        </PopoverTrigger>
        <PopoverContent align="start" className="project-selection-options">
          <PopoverTitle className="sr-only">Select projects</PopoverTitle>
          <Button
            variant="ghost"
            disabled={selectedCount === 0}
            onClick={() => {
              setOpen(false)
              table.resetRowSelection(true)
            }}
          >
            Select none
          </Button>
          <Button
            variant="ghost"
            disabled={table.getIsAllPageRowsSelected()}
            onClick={() => select(false)}
          >
            Select {pageCount} on this {scope}
          </Button>
          {rows.length > pageCount && (
            <Button
              variant="ghost"
              disabled={selectedCount === rows.length}
              onClick={() => select(true)}
            >
              Select all {rows.length} matching projects
            </Button>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
