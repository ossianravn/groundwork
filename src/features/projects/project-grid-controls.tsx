import { ArrowDown, ArrowUp } from "lucide-react"
import type { DataTable } from "@/kit/data-table/table-features"
import { Button } from "@/kit/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/kit/ui/select"
import type { Project } from "@/demo/model"

const sortOptions = [
  { value: "default", label: "Default order" },
  { value: "name", label: "Project name" },
  { value: "status", label: "Status" },
  { value: "progress", label: "Progress" },
  { value: "owner", label: "Owner" },
  { value: "dueDate", label: "Due date" },
]

export function ProjectGridControls({
  table,
  board = false,
}: {
  table: DataTable<Project>
  board?: boolean
}) {
  const sort = table.state.sorting[0]

  const options = sortOptions.map((option) =>
    option.value === "default" && board
      ? { ...option, label: "Manual order" }
      : option,
  )

  return (
    <div className="project-grid-controls">
      <div className="project-grid-sort">
        <Select
          items={options}
          value={sort?.id ?? "default"}
          onValueChange={(id) => {
            if (id)
              table.setSorting(id === "default" ? [] : [{ id, desc: false }])
          }}
        >
          <SelectTrigger aria-label="Sort projects">
            <SelectValue>
              {sort
                ? sortOptions.find((option) => option.value === sort.id)?.label
                : "Sort"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            <SelectGroup>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {sort && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={sort.desc ? "Sort ascending" : "Sort descending"}
            onClick={() => table.setSorting([{ ...sort, desc: !sort.desc }])}
          >
            {sort.desc ? (
              <ArrowDown aria-hidden="true" />
            ) : (
              <ArrowUp aria-hidden="true" />
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
