import {
  LabelList,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
} from "recharts"
import { ChartTooltip, ChartTooltipContent } from "@/kit/ui/chart"
import { seriesColor } from "@/kit/ui/chart-colors"
import { GalleryPlot } from "./gallery-frame"
import { contributors, statuses, tags } from "./gallery-data"

const statusFill = {
  "in-progress": "var(--in-progress)",
  "in-review": "var(--warning)",
  completed: "var(--success)",
}

// #region pie-donut
export function PieDonut() {
  const data = contributors.map((row, index) => ({
    ...row,
    fill: seriesColor(index),
  }))

  const total = data.reduce((sum, row) => sum + row.completed, 0)

  return (
    <div className="relative">
      <GalleryPlot
        label={`${total} tasks completed by person`}
        config={{ completed: { label: "Completed" } }}
        className="chart-gallery-round"
      >
        <PieChart>
          <ChartTooltip
            content={<ChartTooltipContent nameKey="name" hideLabel />}
          />
          <Pie
            data={data}
            dataKey="completed"
            nameKey="name"
            innerRadius="62%"
            outerRadius="88%"
            stroke="var(--card)"
            strokeWidth={2}
            isAnimationActive={false}
          />
        </PieChart>
      </GalleryPlot>
      <p className="chart-gallery-centre" aria-hidden="true">
        <strong>{total}</strong> tasks
      </p>
    </div>
  )
}
// #endregion

// #region pie-labels
export function PieLabels() {
  const data = statuses.map((row) => ({ ...row, fill: statusFill[row.status] }))

  return (
    <GalleryPlot
      label="Projects by status, with counts on the slices"
      config={{ count: { label: "Projects" } }}
      className="chart-gallery-round"
    >
      <PieChart>
        <ChartTooltip
          content={<ChartTooltipContent nameKey="name" hideLabel />}
        />
        <Pie
          data={data}
          dataKey="count"
          nameKey="name"
          outerRadius="80%"
          stroke="var(--card)"
          strokeWidth={2}
          isAnimationActive={false}
        >
          <LabelList
            dataKey="name"
            position="outside"
            offset={12}
            className="fill-foreground"
            fontSize={12}
          />
        </Pie>
      </PieChart>
    </GalleryPlot>
  )
}
// #endregion

// #region radar-multiple
export function RadarMultiple() {
  const people = [
    { key: "ava", label: "Ava Morgan", color: seriesColor(0) },
    { key: "leo", label: "Leo Chen", color: seriesColor(1) },
  ]

  return (
    <GalleryPlot
      label="Two people's completed tasks by project tag"
      config={Object.fromEntries(people.map((item) => [item.key, item]))}
      className="chart-gallery-round"
    >
      <RadarChart data={tags} outerRadius="70%">
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis
          dataKey="tag"
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
        />
        {people.map((item) => (
          <Radar
            key={item.key}
            dataKey={item.key}
            stroke={item.color}
            strokeWidth={2}
            fill={item.color}
            fillOpacity={0.15}
            dot={{ r: 3, fillOpacity: 1 }}
            isAnimationActive={false}
          />
        ))}
      </RadarChart>
    </GalleryPlot>
  )
}
// #endregion

// #region radar-circle
export function RadarCircle() {
  return (
    <GalleryPlot
      label="One person's completed tasks by project tag, on a circular grid"
      config={{ ava: { label: "Ava Morgan", color: seriesColor(0) } }}
      className="chart-gallery-round"
    >
      <RadarChart data={tags} outerRadius="70%">
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <PolarGrid gridType="circle" stroke="var(--border)" />
        <PolarAngleAxis
          dataKey="tag"
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
        />
        <Radar
          dataKey="ava"
          stroke="var(--color-ava)"
          strokeWidth={2}
          fill="var(--color-ava)"
          fillOpacity={0.2}
          isAnimationActive={false}
        />
      </RadarChart>
    </GalleryPlot>
  )
}
// #endregion

// #region radar-lines
export function RadarLines() {
  return (
    <GalleryPlot
      label="Two outlines compared without fills"
      config={{
        ava: { label: "Ava Morgan", color: seriesColor(0) },
        leo: { label: "Leo Chen", color: seriesColor(1) },
      }}
      className="chart-gallery-round"
    >
      <RadarChart data={tags} outerRadius="70%">
        <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
        <PolarGrid radialLines={false} stroke="var(--border)" />
        <PolarAngleAxis
          dataKey="tag"
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
        />
        <Radar
          dataKey="ava"
          stroke="var(--color-ava)"
          strokeWidth={2}
          fill="none"
          isAnimationActive={false}
        />
        <Radar
          dataKey="leo"
          stroke="var(--color-leo)"
          strokeWidth={2}
          strokeDasharray="4 4"
          fill="none"
          isAnimationActive={false}
        />
      </RadarChart>
    </GalleryPlot>
  )
}
// #endregion
