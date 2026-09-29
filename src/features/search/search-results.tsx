import { Fragment, type ReactNode } from "react"
import { Search } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Input } from "@/kit/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/kit/ui/toggle-group"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/kit/ui/empty"

export interface ResultItem {
  id: string
  title: string
  detail: string
}

export interface ResultGroup {
  kind: string
  label: string
  items: ResultItem[]
}

/** Grouped results show a few each until one kind is chosen. */
const preview = 5

// Workspace-wide results (SYS-10). The query and kind live in the URL, so
// results can be shared and Back restores them.
export function SearchResults({
  query,
  kind,
  groups,
  onQueryChange,
  onKindChange,
  renderTitle,
}: {
  query: string
  /** "" for every kind. */
  kind: string
  groups: ResultGroup[]
  onQueryChange: (query: string) => void
  onKindChange: (kind: string) => void
  /** Link the title; label is the title with matches marked. */
  renderTitle: (
    group: ResultGroup,
    item: ResultItem,
    label: ReactNode,
  ) => ReactNode
}) {
  const total = groups.reduce((sum, group) => sum + group.items.length, 0)
  const shown = groups.filter((group) => !kind || group.kind === kind)
  const terms = query.trim().toLowerCase().split(/\s+/u).filter(Boolean)

  return (
    <div className="search-results">
      <form role="search" onSubmit={(event) => event.preventDefault()}>
        <div className="search-results-field">
          <Search aria-hidden="true" />
          <Input
            type="search"
            value={query}
            autoFocus
            aria-label="Search the workspace"
            placeholder="Search projects, tasks, comments, messages, people and help"
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>
      </form>
      {terms.length > 0 && (
        <ToggleGroup
          aria-label="Result type"
          variant="outline"
          size="sm"
          // Separate chips wrap cleanly on narrow screens.
          spacing={1}
          className="search-results-kinds"
          value={[kind || "all"]}
          onValueChange={(values) =>
            values[0] && onKindChange(values[0] === "all" ? "" : values[0])
          }
        >
          <ToggleGroupItem value="all">All {total}</ToggleGroupItem>
          {groups.map((group) => (
            <ToggleGroupItem
              key={group.kind}
              value={group.kind}
              disabled={group.items.length === 0}
            >
              {group.label} {group.items.length}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
      <p role="status" className="search-results-summary">
        {terms.length === 0
          ? "Type to search this workspace."
          : `${total} ${total === 1 ? "result" : "results"} for “${query.trim()}”`}
      </p>
      {terms.length > 0 && total === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Nothing matches “{query.trim()}”</EmptyTitle>
            <EmptyDescription>
              Every word must appear. Try fewer or different words.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {shown.map((group) => {
        if (group.items.length === 0) return null

        const items = kind ? group.items : group.items.slice(0, preview)

        return (
          <section
            key={group.kind}
            className="search-group"
            aria-labelledby={`search-group-${group.kind}`}
          >
            <h2 id={`search-group-${group.kind}`}>
              {group.label}
              <span className="search-group-count">{group.items.length}</span>
            </h2>
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  {renderTitle(group, item, highlight(item.title, terms))}
                  {item.detail && (
                    <p className="search-result-detail">
                      {highlight(item.detail, terms)}
                    </p>
                  )}
                </li>
              ))}
            </ul>
            {items.length < group.items.length && (
              <Button
                variant="ghost"
                size="sm"
                className="search-group-more"
                onClick={() => onKindChange(group.kind)}
              >
                Show all {group.items.length} {group.label.toLowerCase()}
              </Button>
            )}
          </section>
        )
      })}
    </div>
  )
}

/** Mark each matched term, case-insensitively. */
function highlight(text: string, terms: string[]) {
  if (terms.length === 0) return text

  const pattern = new RegExp(
    `(${terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")).join("|")})`,
    "giu",
  )

  return text
    .split(pattern)
    .map((part, index) =>
      index % 2 ? (
        <mark key={index}>{part}</mark>
      ) : (
        <Fragment key={index}>{part}</Fragment>
      ),
    )
}
