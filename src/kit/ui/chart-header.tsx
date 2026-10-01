import * as React from "react"
import { cn } from "cn"

/**
 * A chart's heading states its result, total first ("68 tasks completed"),
 * rather than naming the chart. Controls that set its scope, such as a
 * period, sit at the end and wrap below on narrow cards.
 */
function ChartHeader({
  title,
  description,
  children,
  className,
}: {
  /** The heading: usually ChartTotal, or a ChartSeriesPicker's labels. */
  title: React.ReactNode
  description?: React.ReactNode
  /** Scope controls: period, range, filters. */
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="chart-header"
      className={cn(
        "flex flex-wrap items-center justify-between gap-(--content-gap)",
        className,
      )}
    >
      <div className="grid min-w-0 gap-1">
        {title}
        {description && (
          <p className="text-(length:--text-meta) text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex max-w-full flex-wrap items-center gap-(--control-gap)">
          {children}
        </div>
      )}
    </div>
  )
}

/** A result heading: the figure large, then what it counts. */
function ChartTotal({
  value,
  unit,
  as: Heading = "h2",
  className,
}: {
  value: React.ReactNode
  unit: React.ReactNode
  as?: "h2" | "h3"
  className?: string
}) {
  return (
    <Heading
      data-slot="chart-total"
      className={cn(
        "flex flex-wrap items-baseline gap-(--control-gap) font-heading text-base font-semibold",
        className,
      )}
    >
      <span className="text-(length:--text-metric) leading-(--leading-metric) tracking-[-0.04em] tabular-nums">
        {value}
      </span>{" "}
      <span>{unit}</span>
    </Heading>
  )
}

export { ChartHeader, ChartTotal }
