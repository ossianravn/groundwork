import { useMemo, useState } from "react"
import { Area, AreaChart, CartesianGrid, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/kit/ui/chart"
import { ChartDataTable } from "@/kit/ui/chart-data-table"
import { ChartTotal } from "@/kit/ui/chart-header"
import { ChartSeriesToggle } from "@/kit/ui/chart-series"
import { maxSeries, seriesColor } from "@/kit/ui/chart-colors"
import { useChartTypography } from "@/kit/ui/use-chart-typography"
import { CompletionDateAxis } from "@/features/overview/completion-date-axis"
import { AnalyticsChartCard } from "@/features/analytics/analytics-chart-card"
import { keyUsage, type ApiKey } from "@/demo/integrations"
import { formatDate } from "@/demo/model"

const dayLabel = (date: string) => formatDate(date)

/**
 * Requests per day for each key over the last 30 days, as stepped areas
 * (shadcn's step area chart): is a key still in use, and did anything
 * spike? A revoked key's line ends where it stopped.
 */
export function ApiUsageChart({ keys }: { keys: ApiKey[] }) {
  const [hidden, setHidden] = useState<string[]>([])

  const used = useMemo(
    () => keys.filter((key) => keyUsage(key.id).length).slice(0, maxSeries),
    [keys],
  )

  const days = useMemo(
    () =>
      (used[0] ? keyUsage(used[0].id) : []).map(({ date }) => ({
        date,
        ...Object.fromEntries(
          used.map((key) => [
            key.id,
            keyUsage(key.id).find((day) => day.date === date)?.requests ?? 0,
          ]),
        ),
      })),
    [used],
  )

  const dates = useMemo(() => days.map((day) => day.date), [days])
  const labels = useMemo(() => dates.map(dayLabel), [dates])

  const { ref, fontSize, lineHeight, fontFamily, labelWidth } =
    useChartTypography(labels)

  const series = used.map((key, index) => ({
    key: key.id,
    label: key.revoked ? `${key.name} (revoked)` : key.name,
    color: seriesColor(index),
  }))

  const total = used.reduce(
    (sum, key) =>
      sum + keyUsage(key.id).reduce((all, day) => all + day.requests, 0),
    0,
  )

  return (
    <AnalyticsChartCard
      label="API requests"
      className="settings-chart"
      empty={!total}
      heading={
        <ChartTotal
          as="h3"
          value={total.toLocaleString("en-GB")}
          unit="requests in 30 days"
        />
      }
      description="Calls made with each key, by day."
      legend={
        <ChartSeriesToggle
          label="Show keys"
          series={series}
          hidden={hidden}
          onHiddenChange={setHidden}
        />
      }
      table={
        <ChartDataTable
          label="API requests data"
          className="chart-data-table"
          rows={days}
          rowKey={(day) => day.date}
          columns={[
            { key: "date", header: "Date", cell: (day) => dayLabel(day.date) },
            ...series.map((item) => ({
              key: item.key,
              header: item.label,
              numeric: true,
              cell: (day: (typeof days)[number]) =>
                Number(
                  Object.entries(day).find(([id]) => id === item.key)?.[1] ?? 0,
                ),
            })),
          ]}
        />
      }
    >
      <div ref={ref} className="analytics-plot">
        <ChartContainer
          role="figure"
          className="analytics-plot-chart settings-chart-plot"
          config={Object.fromEntries(
            series.map((item) => [
              item.key,
              { label: item.label, color: item.color },
            ]),
          )}
          aria-label={`${total} requests in 30 days across ${series.length} keys. Use Show data for each day.`}
        >
          <AreaChart
            data={days}
            margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 4" />
            <CompletionDateAxis
              dates={dates}
              format={dayLabel}
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
                  labelFormatter={(value) => dayLabel(String(value))}
                />
              }
            />
            {series.map((item) => (
              <Area
                key={item.key}
                dataKey={item.key}
                type="step"
                hide={hidden.includes(item.key)}
                stroke={`var(--color-${item.key})`}
                strokeWidth={1.5}
                fill={`var(--color-${item.key})`}
                fillOpacity={0.12}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </div>
    </AnalyticsChartCard>
  )
}
