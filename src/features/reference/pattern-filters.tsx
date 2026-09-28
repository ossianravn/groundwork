import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/kit/ui/field"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
} from "@/kit/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"
import {
  patternCategories,
  patternSurfaces,
  type PatternFilters,
} from "./pattern-catalog"

const categories = [
  { value: "", label: "All categories" },
  ...patternCategories.map((value) => ({ value, label: value })),
]
const surfaces = [
  { value: "", label: "All surfaces" },
  ...patternSurfaces.map((value) => ({ value, label: value })),
]
const availability = [
  { value: "all", label: "All patterns" },
  { value: "example", label: "With an example" },
  { value: "planned", label: "Planned" },
]

export function PatternFilterControls({
  filters,
  onChange,
}: {
  filters: PatternFilters
  onChange: (filters: PatternFilters) => void
}) {
  const active =
    Number(!!filters.surface) + Number(filters.availability !== "all")

  return (
    <>
      <Select
        value={filters.category}
        items={categories}
        onValueChange={(value) => {
          if (value !== null) onChange({ ...filters, category: value })
        }}
      >
        <SelectTrigger aria-label="Pattern category">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {categories.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Popover>
        <PopoverTrigger render={<Button variant="outline" />}>
          <SlidersHorizontal data-icon="inline-start" />
          Filters{active > 0 ? ` (${active})` : ""}
        </PopoverTrigger>
        <PopoverContent align="end">
          <PopoverTitle>Filter patterns</PopoverTitle>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="pattern-surface">Surface</FieldLabel>
              <Select
                value={filters.surface}
                items={surfaces}
                onValueChange={(value) => {
                  if (value !== null) onChange({ ...filters, surface: value })
                }}
              >
                <SelectTrigger id="pattern-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {surfaces.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="pattern-availability">
                Availability
              </FieldLabel>
              <Select
                value={filters.availability}
                items={availability}
                onValueChange={(value) => {
                  if (
                    value === "all" ||
                    value === "example" ||
                    value === "planned"
                  )
                    onChange({ ...filters, availability: value })
                }}
              >
                <SelectTrigger id="pattern-availability">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {availability.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </PopoverContent>
      </Popover>
    </>
  )
}
