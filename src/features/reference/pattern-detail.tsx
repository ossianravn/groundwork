import { ArrowUpRight } from "lucide-react"
import { Badge } from "@/kit/ui/badge"
import { buttonVariants } from "@/kit/ui/button"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/kit/ui/empty"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"
import { components } from "./catalog"
import { patterns } from "./pattern-catalog"
import { PatternPreview } from "./pattern-preview"
import { PatternSource } from "./pattern-source"
import type {
  ReferenceLinkComponent,
  ReferenceContextLinkComponent,
} from "./reference-link"

export function PatternDetail({
  id,
  exampleIndex,
  onExampleChange,
  readSource,
  LinkComponent,
  ContextLink,
}: {
  id: string
  exampleIndex: number
  onExampleChange: (value: number) => void
  readSource: (path: string) => Promise<string>
  LinkComponent: ReferenceLinkComponent
  ContextLink: ReferenceContextLinkComponent
}) {
  const item = patterns.find((pattern) => pattern.id === id)
  if (!item)
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Pattern not found</EmptyTitle>
          <EmptyDescription>
            This ID isn’t in the pattern catalogue.
          </EmptyDescription>
        </EmptyHeader>
        <LinkComponent
          destination="patterns"
          className={buttonVariants({ variant: "outline" })}
        >
          Browse patterns
        </LinkComponent>
      </Empty>
    )

  const selected = item.examples[exampleIndex] ? exampleIndex : 0
  const example = item.examples[selected]
  const related = components.filter((component) =>
    component.patterns.includes(id),
  )
  const choices = item.examples.map((entry, index) => ({
    value: index,
    label: entry.label,
  }))

  return (
    <article className="reference-stack">
      <header className="reference-heading">
        <div className="pattern-detail-meta">
          <code>{item.id}</code>
          <span>
            {item.category} · {item.surface}
          </span>
          <Badge variant={example ? "secondary" : "outline"}>
            {example ? "Example" : "Planned"}
          </Badge>
        </div>
        <h1>{item.title}</h1>
        <p>{item.summary}</p>
      </header>
      {example ? (
        <section
          className="reference-prose pattern-example"
          aria-labelledby="pattern-example-title"
        >
          <div className="pattern-example-toolbar">
            <h2 id="pattern-example-title">Try the example</h2>
            <div className="pattern-example-actions">
              {choices.length > 1 && (
                <Select
                  items={choices}
                  value={selected}
                  onValueChange={(value) => {
                    if (value !== null) onExampleChange(value)
                  }}
                >
                  <SelectTrigger aria-label="Example scenario">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {choices.map((choice) => (
                        <SelectItem key={choice.value} value={choice.value}>
                          {choice.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
              <ContextLink
                href={example.href}
                className={buttonVariants({ variant: "outline" })}
              >
                Open example{" "}
                <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
              </ContextLink>
            </div>
          </div>
          <p>{example.instruction}</p>
          <PatternPreview title={item.title} example={example} />
        </section>
      ) : null}
      <section
        className="reference-prose"
        aria-labelledby="pattern-scope-title"
      >
        <h2 id="pattern-scope-title">
          {example ? "In this example" : "Planned scope"}
        </h2>
        {item.implemented && <p>{item.implemented}</p>}
        {item.deferred && (
          <p>
            {example && <strong>Not included: </strong>}
            {item.deferred}
          </p>
        )}
        {related.length > 0 && (
          <div className="reference-context-links pattern-related">
            {related.map((component) => (
              <LinkComponent
                key={component.id}
                destination="component"
                component={component.id}
              >
                {component.name}
              </LinkComponent>
            ))}
          </div>
        )}
      </section>
      {item.sources.length > 0 && (
        <PatternSource paths={item.sources} readSource={readSource} />
      )}
    </article>
  )
}
