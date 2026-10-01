import { useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/kit/ui/chart"
import { ChartDataTable } from "@/kit/ui/chart-data-table"
import { ChartTotal } from "@/kit/ui/chart-header"
import { hueColor } from "@/kit/ui/chart-colors"
import { useChartTypography } from "@/kit/ui/use-chart-typography"
import { CompletionDateAxis } from "@/features/overview/completion-date-axis"
import type { DeliveryPoint } from "@/demo/delivery"
import { AnalyticsChartCard } from "./analytics-chart-card"
import { signed } from "./signed"

// Two poles that no other Delivery chart uses, so neither reads as a series.
const grew = hueColor("amber")

const shrank = hueColor("sky")

/**
 * Tasks added minus tasks completed, as bars above or below zero (shadcn's
 * negative bar chart). Above the line the backlog grew; below, it shrank.
 */
export function NetChangeChart({
  points,
  net,
  previousNet,
  comparison,
  dateLabel,
}: {
  points: DeliveryPoint[]
  net: number
  previousNet?: number
  comparison?: string
  dateLabel: (date: string) => string
}) {
  const dates = useMemo(() => points.map((point) => point.date), [points])
  const labels = useMemo(() => dates.map(dateLabel), [dates, dateLabel])

  const { ref, fontSize, lineHeight, fontFamily, labelWidth } =
    useChartTypography(labels)

  const verdict =
    net > 0
      ? "The backlog grew"
      : net < 0
        ? "The backlog shrank"
        : "The backlog held steady"

  const change =
    comparison && previousNet !== undefined
      ? `, ${signed(net - previousNet)} vs ${comparison}`
      : ""

  return (
    <AnalyticsChartCard
      label="Change in open tasks"
      empty={points.every((point) => !point.added && !point.completed)}
      heading={
        <ChartTotal as="h3" value={net ? signed(net) : 0} unit="open tasks" />
      }
      description={`${verdict}${change}.`}
      legend={
        <span className="analytics-poles">
          <span>
            <span style={{ background: grew }} aria-hidden="true" />
            Grew
          </span>
          <span>
            <span style={{ background: shrank }} aria-hidden="true" />
            Shrank
          </span>
        </span>
      }
      table={
        <ChartDataTable
          label="Change in open tasks data"
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
              key: "added",
              header: "Added",
              numeric: true,
              cell: (point) => point.added,
            },
            {
              key: "completed",
              header: "Completed",
              numeric: true,
              cell: (point) => point.completed,
            },
            {
              key: "net",
              header: "Change",
              numeric: true,
              cell: (point) => signed(point.net),
            },
          ]}
        />
      }
    >
      <div ref={ref} className="analytics-plot">
        <ChartContainer
          role="figure"
          className="analytics-plot-chart"
          config={{ net: { label: "Change in open tasks" } }}
          aria-label={`${verdict} by ${Math.abs(net)} tasks${change}. Use Show data for values.`}
        >
          <BarChart
            data={points}
            margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
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
            <ReferenceLine y={0} stroke="var(--border)" />
            <ChartTooltip
              cursor={{ fill: "var(--muted)" }}
              content={
                <ChartTooltipContent
                  hideIndicator
                  labelFormatter={(value) => dateLabel(String(value))}
                  formatter={(value) => (
                    <span className="flex w-full justify-between gap-4">
                      <span className="text-muted-foreground">Open tasks</span>
                      <span className="font-mono font-medium tabular-nums">
                        {signed(Number(value))}
                      </span>
                    </span>
                  )}
                />
              }
            />
            <Bar
              dataKey="net"
              radius={3}
              maxBarSize={24}
              isAnimationActive={false}
            >
              {points.map((point) => (
                <Cell key={point.date} fill={point.net > 0 ? grew : shrank} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </AnalyticsChartCard>
  )
}
