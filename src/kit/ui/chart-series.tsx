import * as React from "react"
import { cn } from "cn"

export interface ChartSeries {
  key: string
  label: string
  /** A CSS colour, usually from seriesColor or hueColor. */
  color: string
}

/**
 * A legend whose entries show and hide their series. Each is a toggle
 * button (pressed while shown); the last one shown stays on, so the chart
 * never empties. Hidden series keep their colour, so colour follows the
 * series rather than its position.
 */
function ChartSeriesToggle({
  series,
  hidden,
  onHiddenChange,
  label = "Series",
  className,
}: {
  series: ChartSeries[]
  hidden: string[]
  onHiddenChange: (hidden: string[]) => void
  /** Names the group for assistive technology. */
  label?: string
  className?: string
}) {
  const shown = series.filter((item) => !hidden.includes(item.key)).length

  return (
    <div
      data-slot="chart-series-toggle"
      role="group"
      aria-label={label}
      className={cn("flex flex-wrap items-center gap-1", className)}
    >
      {series.map((item) => {
        const on = !hidden.includes(item.key)
        const last = on && shown === 1

        return (
          <button
            key={item.key}
            type="button"
            aria-pressed={on}
            aria-disabled={last || undefined}
            title={last ? "At least one series stays shown" : undefined}
            onClick={() => {
              if (last) return

              onHiddenChange(
                on
                  ? [...hidden, item.key]
                  : hidden.filter((key) => key !== item.key),
              )
            }}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-(length:--text-meta) outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
              on ? "text-foreground" : "text-muted-foreground line-through",
              last && "cursor-default hover:bg-transparent",
            )}
          >
            <span
              className="size-2.5 shrink-0 rounded-[3px] border-2"
              style={{
                borderColor: item.color,
                backgroundColor: on ? item.color : "transparent",
              }}
              aria-hidden="true"
            />
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Totals that choose which series the chart draws, like shadcn's
 * interactive bar chart. Each is a pressed-state button showing its figure
 * and label; the chosen one reads at full strength.
 */
function ChartSeriesPicker({
  series,
  value,
  onValueChange,
  label,
  className,
}: {
  series: (ChartSeries & { total: React.ReactNode })[]
  value: string
  onValueChange: (key: string) => void
  label: string
  className?: string
}) {
  return (
    <div
      data-slot="chart-series-picker"
      role="group"
      aria-label={label}
      className={cn("-ms-2 flex flex-wrap gap-1", className)}
    >
      {series.map((item) => {
        const on = item.key === value

        return (
          <button
            key={item.key}
            type="button"
            aria-pressed={on}
            onClick={() => onValueChange(item.key)}
            className={cn(
              "flex items-baseline gap-(--control-gap) rounded-lg px-2 py-1 text-start outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50",
              on ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <span className="font-heading text-(length:--text-metric) leading-(--leading-metric) font-semibold tracking-[-0.04em] tabular-nums">
              {item.total}
            </span>
            <span className="font-heading text-base font-semibold">
              {item.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export { ChartSeriesToggle, ChartSeriesPicker }
