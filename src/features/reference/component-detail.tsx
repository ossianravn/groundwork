import { useRef, useState, type ComponentType } from "react"
import { ArrowUpRight, Copy, Check, RotateCcw } from "lucide-react"
import { Button, buttonVariants } from "@/kit/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/kit/ui/tabs"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/kit/ui/empty"
import { components } from "./catalog"
import type {
  ReferenceLinkComponent,
  ReferenceContextLinkComponent,
} from "./reference-link"

export function ComponentDetail({
  id,
  panel,
  onPanelChange,
  LinkComponent,
  ContextLink,
  example,
}: {
  id: string
  panel: "preview" | "code"
  onPanelChange: (panel: "preview" | "code") => void
  LinkComponent: ReferenceLinkComponent
  ContextLink: ReferenceContextLinkComponent
  example?: { Component: ComponentType; source: string }
}) {
  const item = components.find((entry) => entry.id === id)
  const [revision, setRevision] = useState(0)
  const [copy, setCopy] = useState<"idle" | "copied" | "failed">("idle")
  const code = useRef<HTMLElement>(null)

  if (!item || !example)
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Component not found</EmptyTitle>
          <EmptyDescription>
            This component is not in the documented catalogue.
          </EmptyDescription>
        </EmptyHeader>
        <LinkComponent
          destination="components"
          className={buttonVariants({ variant: "outline" })}
        >
          Browse components
        </LinkComponent>
      </Empty>
    )

  async function copySource(source: string) {
    try {
      await navigator.clipboard.writeText(source)
      setCopy("copied")
    } catch {
      setCopy("failed")
      code.current?.focus()

      if (code.current) {
        const range = document.createRange()
        range.selectNodeContents(code.current)
        window.getSelection()?.removeAllRanges()
        window.getSelection()?.addRange(range)
      }
    }
  }

  return (
    <div className="reference-stack">
      <header className="reference-heading">
        <h1>{item.name}</h1>
        <p>{item.purpose}</p>
        <div className="reference-context-links">
          <ContextLink href={item.href}>
            View in context <ArrowUpRight aria-hidden="true" />
          </ContextLink>
          <a
            href={
              item.documentation?.href ??
              `https://ui.shadcn.com/docs/components/base/${item.id}`
            }
            target="_blank"
            rel="noreferrer"
          >
            {item.documentation?.label ?? "shadcn documentation"}{" "}
            <ArrowUpRight aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      </header>
      <Tabs
        value={panel}
        onValueChange={(value) => {
          if (value === "preview" || value === "code") onPanelChange(value)
        }}
      >
        <div className="reference-preview-toolbar">
          <TabsList aria-label="Component example" variant="line">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          {panel === "preview" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRevision((value) => value + 1)}
            >
              <RotateCcw data-icon="inline-start" />
              Reset example
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void copySource(example.source)}
            >
              {copy === "copied" ? (
                <Check data-icon="inline-start" />
              ) : (
                <Copy data-icon="inline-start" />
              )}
              {copy === "copied" ? "Copied" : "Copy code"}
            </Button>
          )}
        </div>
        <TabsContent value="preview" keepMounted>
          <div
            className="reference-preview"
            aria-label={`${item.name} interactive example`}
          >
            <example.Component key={revision} />
          </div>
        </TabsContent>
        <TabsContent value="code">
          <pre className="reference-code">
            <code
              ref={code}
              tabIndex={0}
              aria-label={`${item.name} example source`}
            >
              {example.source}
            </code>
          </pre>
          <p
            className={copy === "failed" ? "reference-copy-error" : "sr-only"}
            role="status"
          >
            {copy === "failed"
              ? "Clipboard access failed. The code is selected; copy it manually."
              : copy === "copied"
                ? "Example code copied."
                : ""}
          </p>
        </TabsContent>
      </Tabs>
      <section className="reference-prose" aria-labelledby="component-usage">
        <h2 id="component-usage">Usage notes</h2>
        <ul>
          {item.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <p>
          Preview changes stay inside this example. Use Reset example to return
          to its starting state.
        </p>
      </section>
      <details className="reference-source-details">
        <summary>Implementation</summary>
        <dl className="reference-source-list">
          <div>
            <dt>Primitive</dt>
            <dd>
              <code>
                {item.implementation ?? `src/components/ui/${item.id}.tsx`}
              </code>
            </dd>
          </div>
          <div>
            <dt>Example</dt>
            <dd>
              <code>src/features/reference/examples/{item.id}-example.tsx</code>
            </dd>
          </div>
          <div>
            <dt>Used in</dt>
            <dd>
              <ContextLink href={item.href}>{item.context}</ContextLink>
            </dd>
          </div>
          <div>
            <dt>Related patterns</dt>
            <dd className="reference-context-links">
              {item.patterns.map((patternId) => (
                <LinkComponent
                  key={patternId}
                  destination="pattern"
                  patternId={patternId}
                >
                  {patternId}
                </LinkComponent>
              ))}
            </dd>
          </div>
        </dl>
      </details>
    </div>
  )
}
