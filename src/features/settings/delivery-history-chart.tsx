import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/kit/ui/chart"
import { ChartDataTable } from "@/kit/ui/chart-data-table"
import { useChartTypography } from "@/kit/ui/use-chart-typography"
import { CompletionDateAxis } from "@/features/overview/completion-date-axis"
import { AnalyticsChartCard } from "@/features/analytics/analytics-chart-card"
import { deliveryHistory, type Webhook } from "@/demo/integrations"
import { formatDate } from "@/demo/model"

const dayLabel = (date: string) => formatDate(date)

// The status ink, softened for a large fill; failures keep full strength.
const deliveredFill = "color-mix(in oklab, var(--success) 72%, var(--card))"

/**
 * Deliveries per day across all endpoints over the last 14 days, delivered
 * and failed stacked (shadcn's stacked bar chart). Outcome is status, so it
 * takes the status colours, and the heading counts failures in words.
 */
export function DeliveryHistoryChart({ webhooks }: { webhooks: Webhook[] }) {
  const days = useMemo(() => {
    const totals = new Map<string, { delivered: number; failed: number }>()

    for (const webhook of webhooks)
      for (const day of deliveryHistory(webhook.id)) {
        const total = totals.get(day.date) ?? { delivered: 0, failed: 0 }

        totals.set(day.date, {
          delivered: total.delivered + day.delivered,
          failed: total.failed + day.failed,
        })
      }

    return [...totals].map(([date, total]) => ({ date, ...total }))
  }, [webhooks])

  const dates = useMemo(() => days.map((day) => day.date), [days])
  const labels = useMemo(() => dates.map(dayLabel), [dates])

  const { ref, fontSize, lineHeight, fontFamily, labelWidth } =
    useChartTypography(labels)

  const delivered = days.reduce((sum, day) => sum + day.delivered, 0)
  const failed = days.reduce((sum, day) => sum + day.failed, 0)

  const heading = failed
    ? `${failed} failed ${failed === 1 ? "delivery" : "deliveries"} in 14 days`
    : `All ${delivered} deliveries succeeded`

  return (
    <AnalyticsChartCard
      label="Deliveries"
      className="settings-chart"
      empty={!delivered && !failed}
      heading={
        <h3 className="font-heading text-base font-semibold">{heading}</h3>
      }
      description={`${delivered} delivered across ${webhooks.length} endpoints. Each endpoint lists its recent deliveries below.`}
      legend={
        <span className="analytics-poles">
          <span>
            <span style={{ background: deliveredFill }} aria-hidden="true" />
            Delivered
          </span>
          <span>
            <span
              style={{ background: "var(--destructive)" }}
              aria-hidden="true"
            />
            Failed
          </span>
        </span>
      }
      table={
        <ChartDataTable
          label="Deliveries data"
          className="chart-data-table"
          rows={days}
          rowKey={(day) => day.date}
          columns={[
            { key: "date", header: "Date", cell: (day) => dayLabel(day.date) },
            {
              key: "delivered",
              header: "Delivered",
              numeric: true,
              cell: (day) => day.delivered,
            },
            {
              key: "failed",
              header: "Failed",
              numeric: true,
              cell: (day) => day.failed,
            },
          ]}
        />
      }
    >
      <div ref={ref} className="analytics-plot">
        <ChartContainer
          role="figure"
          className="analytics-plot-chart settings-chart-plot"
          config={{
            delivered: { label: "Delivered", color: deliveredFill },
            failed: { label: "Failed", color: "var(--destructive)" },
          }}
          aria-label={`${heading}; ${delivered} delivered. Use Show data for each day.`}
        >
          <BarChart
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
              cursor={{ fill: "var(--muted)" }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => dayLabel(String(value))}
                />
              }
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
        </ChartContainer>
      </div>
    </AnalyticsChartCard>
  )
}
