import { useState } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartTooltip, ChartTooltipContent } from "@/kit/ui/chart"
import { ChartSeriesToggle } from "@/kit/ui/chart-series"
import { seriesColor } from "@/kit/ui/chart-colors"
import { GalleryPlot } from "./gallery-frame"
import { daily, dateTick, openProjects, share } from "./gallery-data"

// #region area-gradient
export function AreaGradient() {
  const [hidden, setHidden] = useState<string[]>([])

  const series = [
    { key: "completed", label: "Completed", color: seriesColor(0) },
    { key: "added", label: "Added", color: seriesColor(1) },
  ]

  return (
    <div className="grid gap-3">
      <GalleryPlot
        label="Tasks completed and added per day"
        config={Object.fromEntries(series.map((item) => [item.key, item]))}
      >
        <AreaChart data={daily} margin={{ left: 0, right: 8, top: 8 }}>
          <defs>
            {series.map((item) => (
              <linearGradient
                key={item.key}
                id={`area-${item.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={item.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={item.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
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
          {series.map((item) => (
            <Area
              key={item.key}
              dataKey={item.key}
              type="monotone"
              hide={hidden.includes(item.key)}
              stroke={item.color}
              strokeWidth={2}
              fill={`url(#area-${item.key})`}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </GalleryPlot>
      <ChartSeriesToggle
        series={series}
        hidden={hidden}
        onHiddenChange={setHidden}
      />
    </div>
  )
}
// #endregion

// #region area-stacked
export function AreaStacked() {
  return (
    <GalleryPlot
      label="Open tasks per project at each week's end, stacked"
      config={Object.fromEntries(
        openProjects.map((project) => [
          project.id,
          { label: project.name, color: project.fill },
        ]),
      )}
    >
      <AreaChart data={share} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 4" />
        <XAxis
          dataKey="date"
          tickFormatter={dateTick}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          width="auto"
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent indicator="dot" labelFormatter={dateTick} />
          }
        />
        {openProjects.map((project) => (
          <Area
            key={project.id}
            dataKey={project.id}
            stackId="open"
            type="monotone"
            stroke={project.fill}
            fill={project.fill}
            fillOpacity={0.45}
            isAnimationActive={false}
          />
        ))}
      </AreaChart>
    </GalleryPlot>
  )
}
// #endregion

// #region area-expanded
export function AreaExpanded() {
  return (
    <GalleryPlot
      label="Each project's share of open tasks at each week's end"
      config={Object.fromEntries(
        openProjects.map((project) => [
          project.id,
          { label: project.name, color: project.fill },
        ]),
      )}
    >
      <AreaChart
        data={share}
        stackOffset="expand"
        margin={{ left: 0, right: 8, top: 8 }}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 4" />
        <XAxis
          dataKey="date"
          tickFormatter={dateTick}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          width="auto"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: number) => `${Math.round(value * 100)}%`}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent indicator="line" labelFormatter={dateTick} />
          }
        />
        {openProjects.map((project) => (
          <Area
            key={project.id}
            dataKey={project.id}
            stackId="share"
            type="monotone"
            stroke={project.fill}
            fill={project.fill}
            fillOpacity={0.55}
            isAnimationActive={false}
          />
        ))}
      </AreaChart>
    </GalleryPlot>
  )
}
// #endregion

// #region area-step
export function AreaStep() {
  return (
    <GalleryPlot
      label="Tasks completed per day, as steps"
      config={{ completed: { label: "Completed", color: "var(--brand)" } }}
    >
      <AreaChart data={daily} margin={{ left: 0, right: 8, top: 8 }}>
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
        <Area
          dataKey="completed"
          type="step"
          stroke="var(--color-completed)"
          strokeWidth={1.5}
          fill="var(--color-completed)"
          fillOpacity={0.12}
          isAnimationActive={false}
        />
      </AreaChart>
    </GalleryPlot>
  )
}
// #endregion
