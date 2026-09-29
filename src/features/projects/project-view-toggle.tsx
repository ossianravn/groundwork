import { ChartGantt, Columns3, LayoutGrid, Table2 } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/kit/ui/toggle-group"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/kit/ui/select"
import type { ProjectTableState } from "@/features/overview/project-table-state"

export function ProjectViewToggle({
  value,
  onChange,
}: {
  value: ProjectTableState["view"]
  onChange: (view: ProjectTableState["view"]) => void
}) {
  const views = [
    { value: "table", label: "Table", icon: Table2 },
    { value: "grid", label: "Cards", icon: LayoutGrid },
    { value: "board", label: "Board", icon: Columns3 },
    { value: "timeline", label: "Timeline", icon: ChartGantt },
  ] as const

  const current = views.find((view) => view.value === value)!

  return (
    <>
      <ToggleGroup
        className="project-view-toggle"
        aria-label="Project view"
        variant="outline"
        spacing={0}
        value={[value]}
        onValueChange={(values) => {
          const next = values[0]

          if (isView(next)) onChange(next)
        }}
      >
        <ToggleGroupItem value="table" aria-label="Table" title="Table">
          <Table2 aria-hidden="true" data-icon="inline-start" />
          <span className="project-view-label">Table</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="grid" aria-label="Cards" title="Cards">
          <LayoutGrid aria-hidden="true" data-icon="inline-start" />
          <span className="project-view-label">Cards</span>
        </ToggleGroupItem>
        <ToggleGroupItem value="board" aria-label="Board" title="Board">
          <Columns3 aria-hidden="true" data-icon="inline-start" />
          <span className="project-view-label">Board</span>
        </ToggleGroupItem>
        <ToggleGroupItem
          value="timeline"
          aria-label="Timeline"
          title="Timeline"
        >
          <ChartGantt aria-hidden="true" data-icon="inline-start" />
          <span className="project-view-label">Timeline</span>
        </ToggleGroupItem>
      </ToggleGroup>
      <Select
        items={views}
        value={value}
        onValueChange={(next) => {
          if (isView(next)) onChange(next)
        }}
      >
        <SelectTrigger
          className="project-view-select"
          aria-label="Project view"
          title={current.label}
        >
          <SelectValue>
            <current.icon aria-hidden="true" />
            <span className="project-view-current">{current.label}</span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="end" alignItemWithTrigger={false}>
          <SelectGroup>
            {views.map((view) => (
              <SelectItem key={view.value} value={view.value}>
                <view.icon aria-hidden="true" />
                {view.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  )
}

function isView(value: unknown): value is ProjectTableState["view"] {
  return (
    value === "table" ||
    value === "grid" ||
    value === "board" ||
    value === "timeline"
  )
}
