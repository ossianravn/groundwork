import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts"
import { ChartTooltip, ChartTooltipContent } from "@/kit/ui/chart"
import { RadialProgress } from "@/kit/ui/radial-progress"
import { Sparkline } from "@/kit/ui/sparkline"
import { trendLabel } from "@/kit/ui/sparkline-label"
import { CalendarHeatmap } from "@/kit/ui/calendar-heatmap"
import { UptimeStrip } from "@/kit/ui/uptime-strip"
import company from "@/demo/data/public-company.json"
import { dateOffset } from "@/demo/report-period"
import { GalleryPlot } from "./gallery-frame"
import { completionsByDay, daily, progress } from "./gallery-data"

// #region radial-ring
export function RadialRing() {
  return (
    <div className="flex flex-wrap gap-6">
      {progress.slice(0, 4).map((project) => {
        const percent = Math.round((project.done / project.total) * 100)

        return (
          <span
            key={project.name}
            className="grid justify-items-center gap-2 text-xs text-muted-foreground"
          >
            <RadialProgress
              value={percent}
              color={project.fill}
              label={`${project.name}: ${percent}% complete`}
              className="size-16"
            >
              {percent}%
            </RadialProgress>
            {project.name}
          </span>
        )
      })}
    </div>
  )
}
// #endregion

// #region radial-stacked
export function RadialStacked() {
  const data = progress.map((project) => ({
    ...project,
    percent: Math.round((project.done / project.total) * 100),
  }))

  return (
    <GalleryPlot
      label="Each project's share of tasks done, as concentric rings"
      config={{ percent: { label: "Done" } }}
      className="chart-gallery-round"
    >
      <RadialBarChart
        data={data}
        innerRadius="30%"
        outerRadius="95%"
        startAngle={90}
        endAngle={-270}
        barSize={9}
      >
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <ChartTooltip
          content={<ChartTooltipContent nameKey="name" hideLabel />}
        />
        <RadialBar
          dataKey="percent"
          background={{ fill: "var(--muted)" }}
          cornerRadius={999}
          isAnimationActive={false}
        />
      </RadialBarChart>
    </GalleryPlot>
  )
}
// #endregion

// #region small-sparkline
export function SmallSparkline() {
  const values = daily.map((day) => day.completed)

  return (
    <div className="grid max-w-56 gap-1">
      <span className="text-xs text-muted-foreground">Tasks completed</span>
      <span className="flex items-end justify-between gap-4">
        <strong className="text-3xl tabular-nums">{values.at(-1)}</strong>
        <Sparkline
          values={values}
          label={`Tasks completed per day: ${trendLabel(values, "14 days")}`}
          className="w-28"
        />
      </span>
    </div>
  )
}
// #endregion

// #region small-heatmap
export function SmallHeatmap() {
  return (
    <CalendarHeatmap
      days={completionsByDay}
      label="Completed tasks by day"
      describe={(value) => `${value} tasks completed`}
    />
  )
}
// #endregion

// #region small-uptime
export function SmallUptime() {
  const api = company.status.components.find(
    (component) => component.id === "api",
  )

  return (
    <UptimeStrip
      label="API"
      days={Array.from({ length: 90 }, (_, index) => ({
        date: dateOffset("2026-09-24", index - 89),
        incident: api?.incidentDays.includes(89 - index)
          ? "Elevated errors"
          : undefined,
      }))}
    />
  )
}
// #endregion
