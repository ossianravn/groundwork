import { useRef } from "react"
import { Search, X, ArrowRight } from "lucide-react"
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
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/kit/ui/empty"
import { componentCategories, searchComponents } from "./catalog"
import type { ReferenceLinkComponent } from "./reference-link"

export function ComponentCatalog({
  query,
  category,
  onChange,
  LinkComponent,
}: {
  query: string
  category: string
  onChange: (query: string, category: string) => void
  LinkComponent: ReferenceLinkComponent
}) {
  const input = useRef<HTMLInputElement>(null)
  const results = searchComponents(query, category)

  const categories = [
    { value: "", label: "All categories" },
    ...componentCategories.map((value) => ({ value, label: value })),
  ]

  function clear() {
    onChange("", "")
    input.current?.focus()
  }

  return (
    <div className="reference-stack">
      <header className="reference-heading">
        <h1>Components</h1>
        <p>
          Shared primitives, working examples, and the code used to build them.
        </p>
      </header>
      <search className="reference-search" aria-label="Component catalogue">
        <InputGroup>
          <InputGroupAddon>
            <Search aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            ref={input}
            type="search"
            value={query}
            onChange={(event) => onChange(event.target.value, category)}
            aria-label="Search components"
            placeholder="Search by name, task or pattern ID…"
          />
          {query && (
            <InputGroupAddon align="inline-end">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Clear search"
                onClick={() => {
                  onChange("", category)
                  input.current?.focus()
                }}
              >
                <X />
              </Button>
            </InputGroupAddon>
          )}
        </InputGroup>
        <Select
          value={category}
          items={categories}
          onValueChange={(value) => {
            if (value !== null) onChange(query, value)
          }}
        >
          <SelectTrigger aria-label="Component category">
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
      </search>
      <p className="reference-result-count" role="status">
        {results.length} documented{" "}
        {results.length === 1 ? "component" : "components"}
      </p>
      {results.length ? (
        <ul className="reference-component-list">
          {results.map((item) => (
            <li key={item.id}>
              <LinkComponent destination="component" component={item.id}>
                <span className="reference-component-title">
                  <strong>{item.name}</strong>
                  <ArrowRight aria-hidden="true" />
                </span>
                <p>{item.purpose}</p>
                <span className="reference-category">{item.category}</span>
              </LinkComponent>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No components found</EmptyTitle>
            <EmptyDescription>
              Try a name such as “Select”, a task such as “choose”, or a pattern
              ID such as “SETT-13”.
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
