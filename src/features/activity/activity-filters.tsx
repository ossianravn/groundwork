import { Search, RotateCcw, ListFilter } from "lucide-react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/kit/ui/drawer"
import { Badge } from "@/kit/ui/badge"
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
  count,
  onChange,
}: {
  value: Filters
  people: Member[]
  /** Matching events: the toolbar's result count and the drawer's button. */
  count: number
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
      <Drawer>
        <DrawerTrigger
          className="activity-mobile-filters"
          render={<Button variant="outline" />}
        >
          <ListFilter data-icon="inline-start" aria-hidden="true" />
          Filters
          {active > 0 && <span>({active})</span>}
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Filter activity</DrawerTitle>
          </DrawerHeader>
          <div className="activity-filter-drawer">
            {groups.map((group) => (
              <div key={group.key} className="activity-filter-field">
                <span>{group.label}</span>
                {renderSelect(group)}
              </div>
            ))}
          </div>
          <DrawerFooter>
            <DrawerClose render={<Button />}>
              Show {count} {count === 1 ? "event" : "events"}
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
      {!!(value.q || value.member || value.kind || value.period) && (
        <Button
          variant="ghost"
          className="filter-reset"
          aria-label="Reset filters"
          title="Reset filters"
          onClick={() => {
            document.getElementById("activity-query")?.focus()
            onChange({ q: "", member: "", kind: "", period: 0 })
          }}
        >
          <RotateCcw data-icon="inline-start" aria-hidden="true" />
          <span>Reset</span>
        </Button>
      )}
      <Badge variant="count" className="activity-count" role="status">
        {count} {count === 1 ? "event" : "events"}
      </Badge>
    </div>
  )
}
