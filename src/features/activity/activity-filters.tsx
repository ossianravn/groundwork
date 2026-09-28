import { Search, RotateCcw, ListFilter } from "lucide-react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
} from "@/kit/ui/popover"
import { Button } from "@/kit/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/kit/ui/input-group"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/kit/ui/select"
import { activityKinds, type ActivityFilters as Filters } from "@/demo/activity"
import type { Member } from "@/demo/model"

export function ActivityFilters({
  value,
  people,
  onChange,
}: {
  value: Filters
  people: Member[]
  onChange: (value: Filters) => void
}) {
  const groups = [
    {
      key: "member",
      label: "Activity member",
      items: [
        { value: "", label: "All members" },
        ...people.map((person) => ({ value: person.id, label: person.name })),
        ...(value.member && !people.some((p) => p.id === value.member)
          ? [{ value: value.member, label: "Former member" }]
          : []),
      ],
    },
    {
      key: "kind",
      label: "Event type",
      items: [
        { value: "", label: "All events" },
        ...Object.entries(activityKinds).map(([value, label]) => ({
          value,
          label,
        })),
      ],
    },
    {
      key: "period",
      label: "Activity period",
      items: [
        { value: "0", label: "All dates" },
        ...[7, 14, 30].map((days) => ({
          value: String(days),
          label: `Last ${days} days`,
        })),
      ],
    },
  ] as const

  function renderSelect(group: (typeof groups)[number]) {
    return (
      <Select
        key={group.key}
        items={group.items}
        value={String(value[group.key])}
        onValueChange={(selected) => {
          if (selected !== null)
            onChange({
              ...value,
              [group.key]: group.key === "period" ? Number(selected) : selected,
            })
        }}
      >
        <SelectTrigger aria-label={group.label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {group.items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    )
  }

  const active = [value.member, value.kind, value.period].filter(Boolean).length

  return (
    <div
      className="activity-filters"
      role="search"
      aria-label="Filter activity"
    >
      <InputGroup>
        <InputGroupAddon>
          <Search aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          id="activity-query"
          type="search"
          aria-label="Search activity"
          placeholder="Search activity…"
          value={value.q}
          onChange={(e) => onChange({ ...value, q: e.target.value })}
        />
      </InputGroup>
      <div className="activity-filter-options">{groups.map(renderSelect)}</div>
      <Popover>
        <PopoverTrigger
          className="activity-mobile-filters"
          render={<Button variant="outline" />}
        >
          <ListFilter data-icon="inline-start" aria-hidden="true" />
          Filters
          {active > 0 && <span>({active})</span>}
        </PopoverTrigger>
        <PopoverContent align="end" className="activity-filter-popover">
          <PopoverTitle>Filter activity</PopoverTitle>
          {groups.map((group) => (
            <div key={group.key} className="activity-filter-field">
              <span>{group.label}</span>
              {renderSelect(group)}
            </div>
          ))}
        </PopoverContent>
      </Popover>
      {!!(value.q || value.member || value.kind || value.period) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            document.getElementById("activity-query")?.focus()
            onChange({ q: "", member: "", kind: "", period: 0 })
          }}
        >
          <RotateCcw data-icon="inline-start" aria-hidden="true" />
          Reset
        </Button>
      )}
    </div>
  )
}
