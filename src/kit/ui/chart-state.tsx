import * as React from "react"
import { ChartNoAxesColumn, CircleAlert } from "lucide-react"
import { cn } from "cn"
import { Button } from "./button"

/**
 * What a chart shows instead of marks: loading (bars of placeholder at the
 * chart's size, so nothing moves when data arrives), no data for the range,
 * or failed with Retry. It takes the chart's place and height.
 */
function ChartState({
  status,
  title,
  description,
  onRetry,
  className,
}: {
  status: "loading" | "empty" | "error"
  /** Defaults: "Loading chart", "No data for this range", "Couldn't load". */
  title?: string
  description?: React.ReactNode
  onRetry?: () => void
  className?: string
}) {
  const frame = cn(
    "flex h-full min-h-64 w-full flex-col items-center justify-center gap-2 rounded-lg text-center",
    className,
  )

  if (status === "loading")
    return (
      <div
        data-slot="chart-state"
        data-status="loading"
        role="status"
        className={cn(frame, "items-stretch justify-end gap-0 px-2")}
      >
        <span className="sr-only">{title ?? "Loading chart"}</span>
        <span className="flex h-3/4 items-end gap-[6%]" aria-hidden="true">
          {[45, 70, 35, 85, 55, 65, 40].map((height, index) => (
            <span
              key={index}
              className="flex-1 animate-pulse rounded-t-sm bg-muted motion-reduce:animate-none"
              style={{ height: `${height}%` }}
            />
          ))}
        </span>
      </div>
    )

  const failed = status === "error"
  const Icon = failed ? CircleAlert : ChartNoAxesColumn

  return (
    <div
      data-slot="chart-state"
      data-status={status}
      role={failed ? "alert" : undefined}
      className={frame}
    >
      <Icon
        className={cn(
          "size-5",
          failed ? "text-destructive" : "text-muted-foreground",
        )}
        aria-hidden="true"
      />
      <p className="text-sm font-medium">
        {title ??
          (failed ? "Couldn't load this chart" : "No data for this range")}
      </p>
      {description && (
        <p className="max-w-xs text-(length:--text-meta) text-muted-foreground">
          {description}
        </p>
      )}
      {failed && onRetry && (
        <Button variant="outline" size="sm" className="mt-1" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

export { ChartState }
