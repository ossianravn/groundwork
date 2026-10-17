import * as React from "react"
import { cn } from "cn"

/**
 * One header for every chart: a title naming what it shows, the key figure
 * with its unit, a one-line takeaway, and the controls that set its scope
 * (period, project, people) at the end, wrapping below on narrow cards.
 */
function ChartHeader({
  title,
  figure,
  description,
  headingLevel: Heading = "h3",
  children,
  className,
}: {
  /** Names what the chart shows, as a heading. */
  title: React.ReactNode
  /** The key figure: ChartTotal, or a ChartSeriesPicker's totals. */
  figure?: React.ReactNode
  /** The takeaway, in one line. */
  description?: React.ReactNode
  /** h2 when the chart is a page section of its own. */
  headingLevel?: "h2" | "h3"
  /** Scope controls: period, range, project, people. */
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="chart-header"
      className={cn(
        "flex flex-wrap items-start justify-between gap-(--gap-group)",
        className,
      )}
    >
      <div className="grid min-w-0 gap-(--gap-inline)">
        <Heading
          data-slot="chart-title"
          className={cn(
            "font-heading font-semibold",
            Heading === "h2"
              ? "text-(length:--text-section)"
              : "text-(length:--text-body)",
          )}
        >
          {title}
        </Heading>
        {figure}
        {description && (
          <p className="text-(length:--text-meta) text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex max-w-full flex-wrap items-center gap-(--gap-control)">
          {children}
        </div>
      )}
    </div>
  )
}

/** The key figure, large, then what it counts. */
function ChartTotal({
  value,
  unit,
  as: Element = "p",
  className,
}: {
  value: React.ReactNode
  unit: React.ReactNode
  /** A heading when the figure stands without a ChartHeader title. */
  as?: "p" | "h2" | "h3"
  className?: string
}) {
  return (
    <Element
      data-slot="chart-total"
      className={cn(
        "flex flex-wrap items-baseline gap-(--gap-control) font-heading",
        className,
      )}
    >
      <span className="text-(length:--text-metric) leading-(--leading-metric) font-semibold tracking-[-0.04em] tabular-nums">
        {value}
      </span>{" "}
      <span className="text-(length:--text-body) font-medium text-muted-foreground">
        {unit}
      </span>
    </Element>
  )
}

export { ChartHeader, ChartTotal }
