import { useMemo } from "react"
import { CartesianGrid, LabelList, Line, LineChart, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/kit/ui/chart"
import { ChartDataTable } from "@/kit/ui/chart-data-table"
import { ChartTotal } from "@/kit/ui/chart-header"
import { useChartTypography } from "@/kit/ui/use-chart-typography"
import { CompletionDateAxis } from "@/features/overview/completion-date-axis"
import type { DeliveryPoint } from "@/demo/delivery"
import { AnalyticsChartCard } from "./analytics-chart-card"

const days = (value: number) =>
  `${Number(value.toFixed(1))} ${value === 1 ? "day" : "days"}`

/**
 * The median days from adding a task to completing it, for the tasks
 * completed in each day or week (shadcn's line chart with labels). Values
 * sit on the points, so the trend reads without hovering.
 */
export function CycleTimeChart({
  points,
  cycle,
  previousCycle,
  comparison,
  dateLabel,
}: {
  points: DeliveryPoint[]
  cycle: number | null
  previousCycle?: number | null
  comparison?: string
  dateLabel: (date: string) => string
}) {
  const dates = useMemo(() => points.map((point) => point.date), [points])
  const labels = useMemo(() => dates.map(dateLabel), [dates, dateLabel])

  const { ref, fontSize, lineHeight, fontFamily, labelWidth } =
    useChartTypography(labels)

  const change =
    comparison && cycle !== null && previousCycle != null
      ? ` ${cycle <= previousCycle ? "Faster" : "Slower"} by ${days(Math.abs(cycle - previousCycle))} than the ${comparison}.`
      : ""

  const heading =
    cycle === null ? (
      <ChartTotal as="h3" value="–" unit="median cycle time" />
    ) : (
      <ChartTotal
        as="h3"
        value={Number(cycle.toFixed(1))}
        unit={`${cycle === 1 ? "day" : "days"} median cycle time`}
      />
    )

  return (
    <AnalyticsChartCard
      label="Cycle time"
      empty={cycle === null}
      heading={heading}
      description={`From adding a task to completing it.${change}`}
      table={
        <ChartDataTable
          label="Cycle time data"
          className="chart-data-table"
          rows={points}
          rowKey={(point) => point.date}
          columns={[
            {
              key: "date",
              header: "Date",
              cell: (point) => dateLabel(point.date),
            },
            {
              key: "completed",
              header: "Completed",
              numeric: true,
              cell: (point) => point.completed,
            },
            {
              key: "cycle",
              header: "Median days",
              numeric: true,
              cell: (point) =>
                point.cycle === null ? "—" : Number(point.cycle.toFixed(1)),
            },
          ]}
        />
      }
    >
      <div ref={ref} className="analytics-plot">
        <ChartContainer
          role="figure"
          className="analytics-plot-chart"
          config={{ cycle: { label: "Median days", color: "var(--brand)" } }}
          aria-label={`${cycle === null ? "No tasks completed" : `Median cycle time ${days(cycle)}`}.${change} Use Show data for values.`}
        >
          <LineChart
            data={points}
            margin={{ left: 0, right: 16, top: 20, bottom: 0 }}
          >
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
              {points.length <= 16 && (
                <LabelList
                  dataKey="cycle"
                  position="top"
                  offset={10}
                  className="fill-foreground"
                  fontSize={fontSize}
                  formatter={(value) =>
                    value === null || value === undefined
                      ? ""
                      : Number(Number(value).toFixed(1))
                  }
                />
              )}
            </Line>
          </LineChart>
        </ChartContainer>
      </div>
    </AnalyticsChartCard>
  )
}
