import type { ReactNode, RefObject } from "react"
import { RotateCcw, Search, X } from "lucide-react"
import { FacetedFilter, FacetOptions } from "@/kit/data-table/faceted-filter"
import { FacetDrawer } from "@/kit/data-table/facet-drawer"
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
  resultCount,
  children,
  allowAdvanced = false,
}: {
  filters: ProjectFilters
  searchRef: RefObject<HTMLInputElement | null>
  onChange: (filters: ProjectFilters) => void
  members: Member[]
  statusCounts: Map<ProjectStatus, number>
  ownerCounts: Map<string, number>
  /** Projects matching the filters, for the phone drawer. */
  resultCount: number
  children?: ReactNode
  allowAdvanced?: boolean
}) {
  const hasFilters = !!(
    filters.query ||
    filters.statuses.length ||
    filters.owners.length ||
    filters.advanced?.conditions.length
  )

  const statusOptions = statuses.map((value) => ({
    value,
    label: statusLabels[value],
    count: statusCounts.get(value) ?? 0,
  }))

  const ownerOptions = members.map((member) => ({
    value: member.id,
    label: member.name,
    count: ownerCounts.get(member.id) ?? 0,
  }))

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
          options={statusOptions}
          onChange={(values) => onChange({ ...filters, statuses: values })}
        />
        <FacetedFilter
          label="Owner"
          selected={filters.owners}
          options={ownerOptions}
          onChange={(values) => onChange({ ...filters, owners: values })}
        />
        <FacetDrawer
          className="project-facet-drawer"
          title="Filter projects"
          active={filters.statuses.length + filters.owners.length}
          resultLabel={`Show ${resultCount} ${resultCount === 1 ? "project" : "projects"}`}
          onClear={() => onChange({ ...filters, statuses: [], owners: [] })}
        >
          <FacetOptions
            label="Status"
            options={statusOptions}
            selected={filters.statuses}
            onChange={(values) => onChange({ ...filters, statuses: values })}
            showLegend
          />
          <FacetOptions
            label="Owner"
            options={ownerOptions}
            selected={filters.owners}
            onChange={(values) => onChange({ ...filters, owners: values })}
            showLegend
          />
        </FacetDrawer>
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
