import { useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis,
} from "recharts"
import { ChartTooltip, ChartTooltipContent } from "@/kit/ui/chart"
import { ChartSeriesPicker } from "@/kit/ui/chart-series"
import { GalleryPlot } from "./gallery-frame"
import { byProject, byProjectCompared, daily, dateTick } from "./gallery-data"

// #region bar-active
export function BarActive() {
  const last = daily.at(-1)?.date

  return (
    <GalleryPlot
      label="Tasks completed per day; the latest day reads first"
      config={{ completed: { label: "Completed", color: "var(--brand)" } }}
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
        <ChartTooltip
          cursor={{ fill: "var(--muted)" }}
          content={<ChartTooltipContent labelFormatter={dateTick} />}
        />
        <Bar
          dataKey="completed"
          fill="var(--color-completed)"
          radius={[3, 3, 0, 0]}
          maxBarSize={24}
          isAnimationActive={false}
        >
          {daily.map((day) => (
            <Cell key={day.date} fillOpacity={day.date === last ? 1 : 0.5} />
          ))}
        </Bar>
      </BarChart>
    </GalleryPlot>
  )
}
// #endregion

// #region bar-interactive
export function BarInteractive() {
  const [shown, setShown] = useState("completed")

  const totals = {
    completed: daily.reduce((sum, day) => sum + day.completed, 0),
    added: daily.reduce((sum, day) => sum + day.added, 0),
  }

  return (
    <div className="grid gap-3">
      <ChartSeriesPicker
        label="Show tasks"
        value={shown}
        onValueChange={setShown}
        series={[
          {
            key: "completed",
            label: "completed",
            color: "var(--brand)",
            total: totals.completed,
          },
          {
            key: "added",
            label: "added",
            color: "var(--brand)",
            total: totals.added,
          },
        ]}
      />
      <GalleryPlot
        label={`Tasks ${shown} per day`}
        config={{ [shown]: { label: shown, color: "var(--brand)" } }}
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
          <ChartTooltip
            cursor={{ fill: "var(--muted)" }}
            content={<ChartTooltipContent labelFormatter={dateTick} />}
          />
          <Bar
            dataKey={shown}
            fill={`var(--color-${shown})`}
            radius={[3, 3, 0, 0]}
            maxBarSize={24}
            isAnimationActive={false}
          />
        </BarChart>
      </GalleryPlot>
    </div>
  )
}
// #endregion

// #region bar-horizontal
export function BarHorizontal() {
  return (
    <GalleryPlot
      label="Completed tasks by project, last 30 days"
      config={{ completed: { label: "Completed" } }}
    >
      <BarChart
        data={byProject}
        layout="vertical"
        margin={{ left: 0, right: 28 }}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width="auto"
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip
          cursor={{ fill: "var(--muted)" }}
          content={<ChartTooltipContent hideLabel nameKey="name" />}
        />
        <Bar
          dataKey="completed"
          radius={999}
          maxBarSize={14}
          isAnimationActive={false}
        >
          {byProject.map((row) => (
            <Cell key={row.id} fill={row.fill} />
          ))}
          <LabelList
            dataKey="completed"
            position="right"
            className="fill-foreground"
          />
        </Bar>
      </BarChart>
    </GalleryPlot>
  )
}
// #endregion

// #region bar-grouped
export function BarGrouped() {
  return (
    <GalleryPlot
      label="Completed tasks by project, this 30 days beside the 30 before"
      config={{
        completed: { label: "Last 30 days", color: "var(--brand)" },
        previous: { label: "30 days before", color: "var(--muted-foreground)" },
      }}
    >
      <BarChart
        data={byProjectCompared}
        layout="vertical"
        margin={{ left: 0, right: 28 }}
      >
        <XAxis type="number" hide />
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
        <Bar
          dataKey="completed"
          fill="var(--color-completed)"
          radius={999}
          maxBarSize={10}
          isAnimationActive={false}
        />
        <Bar
          dataKey="previous"
          fill="var(--color-previous)"
          fillOpacity={0.35}
          radius={999}
          maxBarSize={6}
          isAnimationActive={false}
        />
      </BarChart>
    </GalleryPlot>
  )
}
// #endregion
