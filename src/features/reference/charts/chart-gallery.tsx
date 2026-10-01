import { useState, type ComponentType, type ReactNode } from "react"
import { ArrowUpRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/kit/ui/tabs"
import { Button } from "@/kit/ui/button"
import type { ChartVariant } from "./gallery-frame"
import { regionSource } from "./gallery-source"

export interface ChartFamily {
  id: string
  name: string
  /** What this family is for, in a sentence. */
  summary: string
  variants: ChartVariant[]
  /** The family's source files, where each variant's region lives. */
  source: string
}

function VariantCard({
  variant,
  source,
  ContextLink,
}: {
  variant: ChartVariant
  source: string
  ContextLink: ComponentType<{
    href: string
    className?: string
    children: ReactNode
  }>
}) {
  const [showCode, setShowCode] = useState(false)
  const code = regionSource(source, variant.id)

  return (
    <li className="chart-gallery-card" id={variant.id}>
      <header>
        <h3>{variant.title}</h3>
        <p>{variant.description}</p>
      </header>
      <div className="chart-gallery-preview">
        <variant.Component />
      </div>
      <footer>
        {variant.usedIn ? (
          <ContextLink
            href={variant.usedIn.href}
            className="chart-gallery-used"
          >
            Used in {variant.usedIn.label}
            <ArrowUpRight aria-hidden="true" />
          </ContextLink>
        ) : (
          <span className="chart-gallery-used" data-reference="">
            Reference only
          </span>
        )}
        <Button
          variant="ghost"
          size="sm"
          aria-expanded={showCode}
          aria-controls={`${variant.id}-code`}
          onClick={() => setShowCode(!showCode)}
        >
          {showCode ? "Hide code" : "Code"}
        </Button>
      </footer>
      {showCode && (
        <pre
          className="reference-code chart-gallery-code"
          id={`${variant.id}-code`}
        >
          <code tabIndex={0} aria-label={`${variant.title} source`}>
            {code}
          </code>
        </pre>
      )}
    </li>
  )
}

/**
 * Every chart the kit supports, by family (as shadcn's chart pages are),
 * each a live preview on the demo's own data with its code and where
 * Tandem uses it. Reference-only variants complete a family.
 */
export function ChartGallery({
  families,
  family,
  onFamilyChange,
  ContextLink,
}: {
  families: ChartFamily[]
  family: string
  onFamilyChange: (family: string) => void
  ContextLink: ComponentType<{
    href: string
    className?: string
    children: ReactNode
  }>
}) {
  return (
    <div className="chart-gallery">
      <header className="reference-heading">
        <h1>Charts</h1>
        <p>
          Every chart in the kit, built from the same pieces: the chart
          container, tooltip, series colours, Show data and chart states.
          Previews use the demo's own data; each says where Tandem uses it.
        </p>
      </header>
      <Tabs
        value={family}
        onValueChange={(value) => {
          const next = families.find((item) => item.id === value)

          if (next) onFamilyChange(next.id)
        }}
      >
        <TabsList
          variant="line"
          aria-label="Chart families"
          className="chart-gallery-tabs"
        >
          {families.map((item) => (
            <TabsTrigger key={item.id} value={item.id}>
              {item.name}
              <span className="chart-gallery-count">
                {item.variants.length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        {families.map((item) => (
          <TabsContent
            key={item.id}
            value={item.id}
            className="chart-gallery-family"
          >
            <p className="chart-gallery-summary">{item.summary}</p>
            <ul className="chart-gallery-grid">
              {item.variants.map((variant) => (
                <VariantCard
                  key={variant.id}
                  variant={variant}
                  source={item.source}
                  ContextLink={ContextLink}
                />
              ))}
            </ul>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
