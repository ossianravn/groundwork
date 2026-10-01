import { useId, useMemo, useState } from "react"
import { Area, CartesianGrid, ComposedChart, Line, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/kit/ui/chart"
import { ChartDataTable, type ChartDataColumn } from "@/kit/ui/chart-data-table"
import { ChartTotal } from "@/kit/ui/chart-header"
import { ChartSeriesToggle } from "@/kit/ui/chart-series"
import { seriesColor } from "@/kit/ui/chart-colors"
import { useChartTypography } from "@/kit/ui/use-chart-typography"
import { CompletionDateAxis } from "@/features/overview/completion-date-axis"
import type { DeliveryPoint } from "@/demo/delivery"
import { AnalyticsChartCard } from "./analytics-chart-card"
import { signed } from "./signed"

const series = [
  { key: "completed", label: "Completed", color: seriesColor(0) },
  { key: "added", label: "Added", color: seriesColor(1) },
]

/**
 * Tasks completed and added over the period, as two areas (shadcn's area
 * chart with gradient fills). The legend shows and hides each; with a
 * comparison, last period's completions follow as a dashed line.
 */
export function ThroughputChart({
  points,
  previous,
  totals,
  comparison,
  dateLabel,
}: {
  points: DeliveryPoint[]
  /** Last period's points, aligned by position; absent without comparison. */
  previous?: DeliveryPoint[]
  totals: { completed: number; added: number; previousCompleted?: number }
  /** "previous 30 days", shown when comparing. */
  comparison?: string
  /** Formats a point's date for the axis, tooltip and table. */
  dateLabel: (date: string) => string
}) {
  const [hidden, setHidden] = useState<string[]>([])
  const fillId = useId().replace(/:/g, "")
  const dates = useMemo(() => points.map((point) => point.date), [points])
  const labels = useMemo(() => dates.map(dateLabel), [dates, dateLabel])

  const { ref, fontSize, lineHeight, fontFamily, labelWidth } =
    useChartTypography(labels)

  const data = points.map((point, index) => ({
    ...point,
    previous: previous?.[index]?.completed,
  }))

  const columns: ChartDataColumn<(typeof data)[number]>[] = [
    { key: "date", header: "Date", cell: (point) => dateLabel(point.date) },
    {
      key: "completed",
      header: "Completed",
      numeric: true,
      cell: (point) => point.completed,
    },
    {
      key: "added",
      header: "Added",
      numeric: true,
      cell: (point) => point.added,
    },
  ]

  if (previous)
    columns.push({
      key: "previous",
      header: "Completed before",
      numeric: true,
      cell: (point) => point.previous ?? "—",
    })

  const change =
    comparison && totals.previousCompleted !== undefined
      ? ` · ${signed(totals.completed - totals.previousCompleted)} completed vs ${comparison}`
      : ""

  return (
    <AnalyticsChartCard
      label="Tasks completed and added"
      className="analytics-throughput"
      empty={!totals.completed && !totals.added}
      heading={
        <ChartTotal as="h3" value={totals.completed} unit="tasks completed" />
      }
      description={`${totals.added} added${change}`}
      legend={
        <span className="analytics-legend-row">
          <ChartSeriesToggle
            label="Show series"
            series={series}
            hidden={hidden}
            onHiddenChange={setHidden}
          />
          {previous && (
            <span className="analytics-previous-key">
              <span aria-hidden="true" />
              Completed, {comparison}
            </span>
          )}
        </span>
      }
      table={
        <ChartDataTable
          label="Tasks completed and added data"
          className="chart-data-table"
          rows={data}
          rowKey={(point) => point.date}
          columns={columns}
        />
      }
    >
      <div ref={ref} className="analytics-plot">
        <ChartContainer
          role="figure"
          className="analytics-plot-chart"
          config={{
            completed: { label: "Completed", color: series[0].color },
            added: { label: "Added", color: series[1].color },
            previous: {
              label: "Completed before",
              color: "var(--muted-foreground)",
            },
          }}
          aria-label={`${totals.completed} tasks completed and ${totals.added} added${change}. Use Show data for values.`}
        >
          <ComposedChart
            data={data}
            margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
          >
            <defs>
              {series.map((item) => (
                <linearGradient
                  key={item.key}
                  id={`${fillId}-${item.key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={`var(--color-${item.key})`}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={`var(--color-${item.key})`}
                    stopOpacity={0.02}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 4" />
            <CompletionDateAxis
              dates={dates}
              format={dateLabel}
              fontSize={fontSize}
              lineHeight={lineHeight}
              labelWidth={labelWidth}
            />
            <YAxis
              width="auto"
              key={`y-${fontFamily}-${fontSize}`}
              fontSize={fontSize}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              allowDecimals={false}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(value) => dateLabel(String(value))}
                />
              }
            />
            {series.map((item) => (
              <Area
                key={item.key}
                dataKey={item.key}
                type="monotone"
                hide={hidden.includes(item.key)}
                stroke={`var(--color-${item.key})`}
                strokeWidth={2}
                fill={`url(#${fillId}-${item.key})`}
                isAnimationActive={false}
              />
            ))}
            {previous && !hidden.includes("completed") && (
              <Line
                dataKey="previous"
                type="monotone"
                stroke="var(--color-previous)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
                isAnimationActive={false}
              />
            )}
          </ComposedChart>
        </ChartContainer>
      </div>
    </AnalyticsChartCard>
  )
}
