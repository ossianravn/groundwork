import type { ReactNode, RefObject } from "react"
import { RotateCcw, Search, X } from "lucide-react"
import { FacetedFilter } from "@/kit/data-table/faceted-filter"
import { Button } from "@/kit/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/kit/ui/input-group"
import { statusLabels, type Member, type ProjectStatus } from "@/demo/model"
import { emptyProjectFilters, type ProjectFilters } from "./project-filtering"
import { AdvancedProjectFilters } from "@/features/projects/advanced-project-filters"

const statuses: ProjectStatus[] = ["in-progress", "in-review", "completed"]

export function ProjectToolbar({
  filters,
  searchRef,
  onChange,
  members,
  statusCounts,
  ownerCounts,
  children,
  allowAdvanced = false,
}: {
  filters: ProjectFilters
  searchRef: RefObject<HTMLInputElement | null>
  onChange: (filters: ProjectFilters) => void
  members: Member[]
  statusCounts: Map<ProjectStatus, number>
  ownerCounts: Map<string, number>
  children?: ReactNode
  allowAdvanced?: boolean
}) {
  const hasFilters = !!(
    filters.query ||
    filters.statuses.length ||
    filters.owners.length ||
    filters.advanced?.conditions.length
  )

  return (
    <div className="project-filters" role="group" aria-label="Project controls">
      <InputGroup className="project-search">
        <InputGroupInput
          ref={searchRef}
          aria-label="Search projects"
          placeholder="Search projects…"
          value={filters.query}
          onChange={(event) =>
            onChange({ ...filters, query: event.target.value })
          }
        />
        <InputGroupAddon>
          <Search aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label="Clear project search"
            disabled={!filters.query}
            onClick={() => {
              onChange({ ...filters, query: "" })
              searchRef.current?.focus()
            }}
          >
            <X aria-hidden="true" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <div className="project-filter-options">
        <FacetedFilter
          label="Status"
          selected={filters.statuses}
          options={statuses.map((value) => ({
            value,
            label: statusLabels[value],
            count: statusCounts.get(value) ?? 0,
          }))}
          onChange={(values) => onChange({ ...filters, statuses: values })}
        />
        <FacetedFilter
          label="Owner"
          selected={filters.owners}
          options={members.map((member) => ({
            value: member.id,
            label: member.name,
            count: ownerCounts.get(member.id) ?? 0,
          }))}
          onChange={(values) => onChange({ ...filters, owners: values })}
        />
        {allowAdvanced && (
          <AdvancedProjectFilters
            value={filters.advanced}
            members={members}
            onChange={(advanced) => onChange({ ...filters, advanced })}
          />
        )}
        <Button
          variant="ghost"
          className="filter-reset"
          aria-label="Reset filters"
          title="Reset filters"
          disabled={!hasFilters}
          focusableWhenDisabled
          onClick={() => onChange(emptyProjectFilters)}
        >
          <RotateCcw aria-hidden="true" data-icon="inline-start" />
          <span>Reset</span>
        </Button>
        {children}
      </div>
    </div>
  )
}
