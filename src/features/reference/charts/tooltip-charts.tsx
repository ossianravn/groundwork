import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { ChartTooltip, ChartTooltipContent } from "@/kit/ui/chart"
import { seriesColor } from "@/kit/ui/chart-colors"
import { GalleryPlot } from "./gallery-frame"
import { daily, dateTick } from "./gallery-data"

const config = {
  completed: { label: "Completed", color: seriesColor(0) },
  added: { label: "Added", color: seriesColor(1) },
}

// The same two series each time; only the tooltip changes. Each opens on
// one day so the tooltip shows without hovering.

// #region tooltip-dot
export function TooltipDot() {
  return (
    <GalleryPlot label="Tasks completed and added per day" config={config}>
      <BarChart data={daily} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 4" />
        <XAxis
          dataKey="date"
          tickFormatter={dateTick}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <ChartTooltip
          defaultIndex={9}
          cursor={{ fill: "var(--muted)" }}
          content={<ChartTooltipContent labelFormatter={dateTick} />}
        />
        <Bar
          dataKey="completed"
          fill="var(--color-completed)"
          radius={[3, 3, 0, 0]}
          isAnimationActive={false}
        />
        <Bar
          dataKey="added"
          fill="var(--color-added)"
          radius={[3, 3, 0, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </GalleryPlot>
  )
}
// #endregion

// #region tooltip-line
export function TooltipLine() {
  return (
    <GalleryPlot label="Tasks completed and added per day" config={config}>
      <BarChart data={daily} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 4" />
        <XAxis
          dataKey="date"
          tickFormatter={dateTick}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <ChartTooltip
          defaultIndex={9}
          cursor={{ fill: "var(--muted)" }}
          content={
            <ChartTooltipContent indicator="line" labelFormatter={dateTick} />
          }
        />
        <Bar
          dataKey="completed"
          fill="var(--color-completed)"
          radius={[3, 3, 0, 0]}
          isAnimationActive={false}
        />
        <Bar
          dataKey="added"
          fill="var(--color-added)"
          radius={[3, 3, 0, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </GalleryPlot>
  )
}
// #endregion

// #region tooltip-formatter
export function TooltipFormatter() {
  return (
    <GalleryPlot label="Tasks completed and added per day" config={config}>
      <BarChart data={daily} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 4" />
        <XAxis
          dataKey="date"
          tickFormatter={dateTick}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <ChartTooltip
          defaultIndex={9}
          cursor={{ fill: "var(--muted)" }}
          content={
            <ChartTooltipContent
              hideIndicator
              labelFormatter={(value) => `Tasks on ${dateTick(value)}`}
              formatter={(value, name) => (
                <span className="flex w-full justify-between gap-4">
                  <span className="text-muted-foreground">
                    {name === "completed" ? "Completed" : "Added"}
                  </span>
                  <span className="font-mono font-medium tabular-nums">
                    {Number(value)} tasks
                  </span>
                </span>
              )}
            />
          }
        />
        <Bar
          dataKey="completed"
          fill="var(--color-completed)"
          radius={[3, 3, 0, 0]}
          isAnimationActive={false}
        />
        <Bar
          dataKey="added"
          fill="var(--color-added)"
          radius={[3, 3, 0, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </GalleryPlot>
  )
}
// #endregion
