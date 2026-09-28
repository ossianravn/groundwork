import { useRef } from "react"
import { Search, X, ArrowRight } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Badge } from "@/kit/ui/badge"
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/kit/ui/input-group"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/kit/ui/empty"
import {
  findPatterns,
  defaultPatternFilters,
  type PatternFilters,
} from "./pattern-catalog"
import { PatternFilterControls } from "./pattern-filters"
import type { ReferenceLinkComponent } from "./reference-link"

export function PatternIndex({
  filters,
  onChange,
  LinkComponent,
}: {
  filters: PatternFilters
  onChange: (filters: PatternFilters) => void
  LinkComponent: ReferenceLinkComponent
}) {
  const input = useRef<HTMLInputElement>(null)
  const results = findPatterns(filters)
  const filtered = !!(
    filters.q ||
    filters.category ||
    filters.surface ||
    filters.availability !== "all"
  )

  function clear() {
    onChange(defaultPatternFilters)
    input.current?.focus()
  }

  return (
    <div className="reference-stack">
      <header className="reference-heading">
        <h1>Patterns</h1>
        <p>
          Reusable compositions from the public site and workspace. Each example
          documents its current scope.
        </p>
      </header>
      <search
        className="reference-search pattern-search"
        aria-label="Pattern catalogue"
      >
        <InputGroup>
          <InputGroupAddon>
            <Search aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            ref={input}
            type="search"
            value={filters.q}
            aria-label="Search patterns"
            placeholder="Search patterns or IDs…"
            onChange={(event) =>
              onChange({ ...filters, q: event.target.value })
            }
          />
          {filters.q && (
            <InputGroupAddon align="inline-end">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Clear search"
                onClick={() => {
                  onChange({ ...filters, q: "" })
                  input.current?.focus()
                }}
              >
                <X />
              </Button>
            </InputGroupAddon>
          )}
        </InputGroup>
        <PatternFilterControls filters={filters} onChange={onChange} />
      </search>
      <div className="pattern-results">
        <p role="status">
          {results.length} {results.length === 1 ? "pattern" : "patterns"}
          {filters.surface ? ` · ${filters.surface}` : ""}
          {filters.availability === "example"
            ? " · With an example"
            : filters.availability === "planned"
              ? " · Planned"
              : ""}
        </p>
        {filtered && (
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear filters
          </Button>
        )}
      </div>
      {results.length ? (
        <ul className="pattern-list">
          {results.map((item) => (
            <li key={item.id}>
              <LinkComponent destination="pattern" patternId={item.id}>
                <div className="pattern-row-meta">
                  <code>{item.id}</code>
                  <span>{item.category}</span>
                </div>
                <div className="pattern-row-content">
                  <strong>{item.title}</strong>
                  <p>{item.summary}</p>
                </div>
                <div className="pattern-row-status">
                  <Badge
                    variant={item.examples.length ? "secondary" : "outline"}
                  >
                    {item.examples.length ? "Example" : "Planned"}
                  </Badge>
                  <ArrowRight aria-hidden="true" />
                </div>
              </LinkComponent>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No patterns found</EmptyTitle>
            <EmptyDescription>
              Try a task such as “filter”, or an ID such as “TABL-02”.
            </EmptyDescription>
          </EmptyHeader>
          <Button variant="outline" onClick={clear}>
            Clear filters
          </Button>
        </Empty>
      )}
    </div>
  )
}
