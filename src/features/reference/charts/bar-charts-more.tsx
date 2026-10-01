import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"
import { ChartTooltip, ChartTooltipContent } from "@/kit/ui/chart"
import { hueColor } from "@/kit/ui/chart-colors"
import { GalleryPlot } from "./gallery-frame"
import { daily, dateTick, deliveries, load, openProjects } from "./gallery-data"

// #region bar-stacked
export function BarStacked() {
  return (
    <GalleryPlot
      label="Open tasks per person now, stacked by project"
      config={Object.fromEntries(
        openProjects.map((project) => [
          project.id,
          { label: project.name, color: project.fill },
        ]),
      )}
    >
      <BarChart data={load} layout="vertical" margin={{ left: 0, right: 16 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 4" />
        <XAxis
          type="number"
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width="auto"
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip
          cursor={{ fill: "var(--muted)" }}
          content={<ChartTooltipContent />}
        />
        {openProjects.map((project) => (
          <Bar
            key={project.id}
            dataKey={project.id}
            stackId="load"
            fill={project.fill}
            stroke="var(--card)"
            strokeWidth={2}
            maxBarSize={16}
            isAnimationActive={false}
          />
        ))}
      </BarChart>
    </GalleryPlot>
  )
}
// #endregion

// #region bar-negative
export function BarNegative() {
  const grew = hueColor("amber")
  const shrank = hueColor("sky")

  return (
    <GalleryPlot
      label="Change in open tasks per day: above zero the backlog grew"
      config={{ net: { label: "Change in open tasks" } }}
    >
      <BarChart data={daily} margin={{ left: 0, right: 8, top: 8 }}>
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
        <ReferenceLine y={0} stroke="var(--border)" />
        <ChartTooltip
          cursor={{ fill: "var(--muted)" }}
          content={
            <ChartTooltipContent hideIndicator labelFormatter={dateTick} />
          }
        />
        <Bar dataKey="net" radius={3} maxBarSize={24} isAnimationActive={false}>
          {daily.map((day) => (
            <Cell key={day.date} fill={day.net > 0 ? grew : shrank} />
          ))}
        </Bar>
      </BarChart>
    </GalleryPlot>
  )
}
// #endregion

// #region bar-outcome
export function BarOutcome() {
  return (
    <GalleryPlot
      label="Webhook deliveries per day, delivered and failed"
      config={{
        delivered: {
          label: "Delivered",
          color: "color-mix(in oklab, var(--success) 72%, var(--card))",
        },
        failed: { label: "Failed", color: "var(--destructive)" },
      }}
    >
      <BarChart data={deliveries} margin={{ left: 0, right: 8, top: 8 }}>
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
          cursor={{ fill: "var(--muted)" }}
          content={<ChartTooltipContent labelFormatter={dateTick} />}
        />
        <Bar
          dataKey="delivered"
          stackId="day"
          fill="var(--color-delivered)"
          maxBarSize={20}
          isAnimationActive={false}
        />
        <Bar
          dataKey="failed"
          stackId="day"
          fill="var(--color-failed)"
          radius={[3, 3, 0, 0]}
          maxBarSize={20}
          isAnimationActive={false}
        />
      </BarChart>
    </GalleryPlot>
  )
}
// #endregion
