import type { ComponentType, ReactNode } from "react"
import { ChartContainer } from "@/kit/ui/chart"
import type { ChartConfig } from "@/kit/ui/chart-context"

export interface ChartVariant {
  /** Also the region name around its code in the family's source. */
  id: string
  title: string
  description: string
  /** Where Tandem uses it; absent for reference-only variants. */
  usedIn?: { label: string; href: string }
  Component: ComponentType
}

/** A gallery preview: the kit's chart container at a fixed, readable size. */
export function GalleryPlot({
  config,
  label,
  className,
  children,
}: {
  config: ChartConfig
  /** The chart's accessible name: what it shows, in words. */
  label: string
  className?: string
  children: ReactNode
}) {
  return (
    <ChartContainer
      role="figure"
      aria-label={label}
      config={config}
      className={["chart-gallery-plot", className].filter(Boolean).join(" ")}
    >
      {children}
    </ChartContainer>
  )
}
