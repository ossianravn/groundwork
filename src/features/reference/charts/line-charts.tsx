import {
  CartesianGrid,
  Dot,
  LabelList,
  Line,
  LineChart,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"
import { ChartTooltip, ChartTooltipContent } from "@/kit/ui/chart"
import { hueColor } from "@/kit/ui/chart-colors"
import { GalleryPlot } from "./gallery-frame"
import { burn, dateTick, weekly } from "./gallery-data"

// #region line-labels
export function LineLabels() {
  return (
    <GalleryPlot
      label="Median days from adding to completing a task, by week"
      config={{ cycle: { label: "Median days", color: "var(--brand)" } }}
    >
      <LineChart data={weekly} margin={{ left: 0, right: 16, top: 20 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 4" />
        <XAxis
          dataKey="date"
          tickFormatter={dateTick}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          width="auto"
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent indicator="line" labelFormatter={dateTick} />
          }
        />
        <Line
          dataKey="cycle"
          type="monotone"
          stroke="var(--color-cycle)"
          strokeWidth={2}
          connectNulls
          dot={{
            r: 4,
            fill: "var(--color-cycle)",
            stroke: "var(--card)",
            strokeWidth: 2,
          }}
          isAnimationActive={false}
        >
          <LabelList
            dataKey="cycle"
            position="top"
            offset={10}
            className="fill-foreground"
            fontSize={12}
          />
        </Line>
      </LineChart>
    </GalleryPlot>
  )
}
// #endregion

// #region line-burn-up
export function LineBurnUp() {
  const color = hueColor("teal")
  const due = "2026-10-08"

  return (
    <GalleryPlot
      label="Website redesign: scope, tasks done and the projection to its due date"
      config={{
        scope: { label: "Scope", color: "var(--muted-foreground)" },
        done: { label: "Done", color },
        projected: { label: "Projected", color },
      }}
    >
      <LineChart data={burn} margin={{ left: 0, right: 16, top: 16 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 4" />
        <XAxis
          dataKey="date"
          tickFormatter={dateTick}
          tickLine={false}
          axisLine={false}
          minTickGap={32}
        />
        <YAxis
          width="auto"
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent indicator="line" labelFormatter={dateTick} />
          }
        />
        <ReferenceLine
          x={due}
          stroke="var(--foreground)"
          strokeDasharray="2 3"
          label={{
            value: "Due",
            position: "insideTopRight",
            fill: "var(--muted-foreground)",
          }}
        />
        <Line
          dataKey="scope"
          type="stepAfter"
          stroke="var(--color-scope)"
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          dataKey="done"
          type="monotone"
          stroke="var(--color-done)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          dataKey="projected"
          type="linear"
          stroke="var(--color-projected)"
          strokeWidth={2}
          strokeDasharray="5 4"
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </GalleryPlot>
  )
}
// #endregion

// #region line-dots
export function LineDots() {
  // Weeks that finished more than they added get a filled dot.
  return (
    <GalleryPlot
      label="Tasks completed by week; filled dots where the backlog shrank"
      config={{ completed: { label: "Completed", color: "var(--brand)" } }}
    >
      <LineChart data={weekly} margin={{ left: 0, right: 16, top: 12 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 4" />
        <XAxis
          dataKey="date"
          tickFormatter={dateTick}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          width="auto"
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent indicator="line" labelFormatter={dateTick} />
          }
        />
        <Line
          dataKey="completed"
          type="linear"
          stroke="var(--color-completed)"
          strokeWidth={2}
          isAnimationActive={false}
          dot={({
            cx,
            cy,
            payload,
            index,
          }: {
            cx?: number
            cy?: number
            payload?: { net: number }
            index?: number
          }) => (
            <Dot
              key={index}
              cx={cx}
              cy={cy}
              r={4}
              stroke="var(--color-completed)"
              strokeWidth={2}
              fill={
                (payload?.net ?? 0) < 0
                  ? "var(--color-completed)"
                  : "var(--card)"
              }
            />
          )}
        />
      </LineChart>
    </GalleryPlot>
  )
}
// #endregion
