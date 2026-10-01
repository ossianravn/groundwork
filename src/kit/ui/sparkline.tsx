import * as React from "react"
import { cn } from "cn"

/**
 * A trend at a glance: a small line and soft area with no axes, the last
 * value marked. It is a picture of the summary its label gives in words
 * ("Down from 102 to 77 over 30 days"), so screen readers get the label.
 * Plain SVG, so it costs nothing to put one in every metric.
 */
function Sparkline({
  values,
  label,
  color = "var(--brand)",
  className,
}: {
  values: number[]
  /** The trend in words; the accessible name of the picture. */
  label: string
  /** A CSS colour for the line, area and last point. */
  color?: string
  className?: string
}) {
  const id = React.useId().replace(/:/g, "")

  if (values.length < 2) return null

  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  // Leave room above and below so the line never touches the edges.
  const y = (value: number) => 90 - ((value - min) / span) * 80
  const x = (index: number) => (index / (values.length - 1)) * 100

  const line = values
    .map((value, index) => `${index ? "L" : "M"}${x(index)},${y(value)}`)
    .join(" ")

  const last = values[values.length - 1]

  return (
    <span
      data-slot="sparkline"
      role="img"
      aria-label={label}
      className={cn("relative block h-8 w-full", className)}
      style={{ color }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="size-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity={0.22} />
            <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={`${line} L100,100 L0,100 Z`} fill={`url(#${id})`} />
        <path
          d={line}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {/* An HTML dot, so it stays round however the SVG is stretched. */}
      <span
        className="absolute size-1.5 -translate-1/2 rounded-full bg-current ring-2 ring-card"
        style={{ left: "100%", top: `${y(last)}%` }}
        aria-hidden="true"
      />
    </span>
  )
}

export { Sparkline }
