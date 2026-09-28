import { useId, useState } from "react"
import { Plus, Search } from "lucide-react"
import { Badge } from "@/kit/ui/badge"
import { Button } from "@/kit/ui/button"
import { Checkbox } from "@/kit/ui/checkbox"
import { Field, FieldLabel, FieldLegend, FieldSet } from "@/kit/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/kit/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/kit/ui/popover"
import { Separator } from "@/kit/ui/separator"

interface FacetOption<Value extends string> {
  value: Value
  label: string
  count: number
}

export function FacetedFilter<Value extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: FacetOption<Value>[]
  selected: Value[]
  onChange: (values: Value[]) => void
}) {
  const id = useId()
  const [search, setSearch] = useState("")

  const visible = options.filter((option) =>
    option.label.toLowerCase().includes(search.trim().toLowerCase()),
  )

  const selectedLabels = options
    .filter((option) => selected.includes(option.value))
    .map((option) => option.label)
    .join(", ")

  return (
    <Popover
      onOpenChange={(open) => {
        if (!open) setSearch("")
      }}
    >
      <PopoverTrigger
        render={<Button variant="outline" className="facet-trigger" />}
        aria-label={`${label}: ${selectedLabels || "All"}`}
        title={selectedLabels || `All ${label.toLowerCase()}`}
      >
        <Plus aria-hidden="true" data-icon="inline-start" />
        {label}
        {selected.length > 0 && (
          <Badge variant="secondary" className="facet-count" aria-hidden="true">
            {selected.length}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="facet-popover">
        <PopoverTitle className="sr-only">
          Filter by {label.toLowerCase()}
        </PopoverTitle>
        <InputGroup>
          <InputGroupInput
            aria-label={`Search ${label.toLowerCase()} options`}
            placeholder={`Search ${label.toLowerCase()}…`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <InputGroupAddon>
            <Search aria-hidden="true" />
          </InputGroupAddon>
        </InputGroup>
        <FieldSet className="facet-options">
          <FieldLegend className="sr-only">{label}</FieldLegend>
          {visible.map((option) => (
            <Field
              orientation="horizontal"
              className="facet-option"
              key={option.value}
            >
              <Checkbox
                id={`${id}-${option.value}`}
                checked={selected.includes(option.value)}
                onCheckedChange={(checked) =>
                  onChange(
                    checked
                      ? [...selected, option.value]
                      : selected.filter((value) => value !== option.value),
                  )
                }
              />
              <FieldLabel htmlFor={`${id}-${option.value}`}>
                <span>{option.label}</span>
                <span className="facet-option-count">
                  <span className="sr-only">Matching projects: </span>
                  {option.count}
                </span>
              </FieldLabel>
            </Field>
          ))}
          {visible.length === 0 && (
            <p className="facet-no-options" role="status">
              No matching options
            </p>
          )}
        </FieldSet>
        <Separator />
        <Button
          variant="ghost"
          disabled={selected.length === 0}
          focusableWhenDisabled
          onClick={() => onChange([])}
        >
          Clear {label.toLowerCase()}
        </Button>
      </PopoverContent>
    </Popover>
  )
}
