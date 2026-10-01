import { useMemo, useState, type ReactNode } from "react"
import { Bar, BarChart, CartesianGrid, Cell, YAxis } from "recharts"
import { CompletionDateAxis } from "./completion-date-axis"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/kit/ui/chart"
import { ChartDataTable } from "@/kit/ui/chart-data-table"
import { ChartHeader } from "@/kit/ui/chart-header"
import { ChartSeriesPicker } from "@/kit/ui/chart-series"
import { Card, CardContent, CardFooter, CardHeader } from "@/kit/ui/card"
import { Button } from "@/kit/ui/button"
import { useChartTypography } from "@/kit/ui/use-chart-typography"
import { taskSeries } from "@/demo/selectors"
import { formatDate, type Activity, type ProjectTask } from "@/demo/model"
import type { ReportWindow } from "@/demo/report-period"

interface CompletionChartProps {
  activity: Activity[]
  tasks: ProjectTask[]
  /** The dates shown; the host's period control owns how they are chosen. */
  range: ReportWindow
  /** Drawn at full strength when the range includes it. */
  snapshotDate: string
  periodControl: ReactNode
}

const series = {
  completed: { label: "completed", heading: "Tasks completed" },
  added: { label: "added", heading: "Tasks added" },
}

type SeriesKey = keyof typeof series

const isSeries = (key: string): key is SeriesKey => Object.hasOwn(series, key)

/**
 * Tasks completed or added each day. The totals in the heading choose the
 * series, as in shadcn's interactive bar chart; one series shows at a time,
 * so the heading names it and no legend is needed.
 */
export function CompletionChart({
  activity,
  tasks,
  range,
  snapshotDate,
  periodControl,
}: CompletionChartProps) {
  const [showData, setShowData] = useState(false)
  const [shown, setShown] = useState<SeriesKey>("completed")

  const days = useMemo(
    () => taskSeries(activity, tasks, range),
    [activity, tasks, range],
  )

  const dates = useMemo(() => days.map((day) => day.date), [days])
  const labels = useMemo(() => dates.map((date) => formatDate(date)), [dates])

  const {
    ref: chartBody,
    fontSize,
    lineHeight,
    fontFamily,
    labelWidth,
  } = useChartTypography(labels)

  const totals = {
    completed: days.reduce((sum, day) => sum + day.completed, 0),
    added: days.reduce((sum, day) => sum + day.added, 0),
  }

  const showsSnapshot = dates.includes(snapshotDate)
  const period = `from ${formatDate(range.start)} to ${formatDate(range.end, { year: "numeric" })}`

  return (
    <Card className="completion-card">
      <CardHeader>
        <ChartHeader
          title={
            <>
              <h2 className="sr-only">Tasks completed and added</h2>
              <ChartSeriesPicker
                label="Show tasks"
                value={shown}
                onValueChange={(key) => {
                  if (isSeries(key)) setShown(key)
                }}
                series={(["completed", "added"] as const).map((key) => ({
                  key,
                  label: series[key].label,
                  color: "var(--brand)",
                  total: totals[key],
                }))}
              />
            </>
          }
        >
          {periodControl}
        </ChartHeader>
      </CardHeader>
      <CardContent ref={chartBody} className="chart-body text-xs">
        {showData ? (
          <ChartDataTable
            label="Daily task data"
            className="chart-data-table"
            rows={days}
            rowKey={(day) => day.date}
            columns={[
              {
                key: "date",
                header: "Date",
                cell: (day) => formatDate(day.date),
              },
              {
                key: "completed",
                header: "Completed",
                numeric: true,
                cell: (day) => day.completed,
              },
              {
                key: "added",
                header: "Added",
                numeric: true,
                cell: (day) => day.added,
              },
            ]}
          />
        ) : (
          <ChartContainer
            role="figure"
            className="completion-chart"
            config={{
              [shown]: { label: series[shown].heading, color: "var(--brand)" },
            }}
            aria-label={`${totals[shown]} tasks ${series[shown].label} ${period}. Use Show data for daily values.`}
          >
            <BarChart
              accessibilityLayer
              data={days}
              barCategoryGap="28%"
              margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 4" />
              <CompletionDateAxis
                dates={dates}
                lineHeight={lineHeight}
                fontSize={fontSize}
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
                    labelFormatter={(value) => formatDate(String(value))}
                  />
                }
              />
              <Bar
                dataKey={shown}
                fill={`var(--color-${shown})`}
                radius={[3, 3, 0, 0]}
                maxBarSize={24}
                isAnimationActive={false}
              >
                {/* Earlier days recede so the snapshot day reads first; a
                    range without it keeps every day at full strength. */}
                {days.map((day) => (
                  <Cell
                    key={day.date}
                    fillOpacity={
                      !showsSnapshot || day.date === snapshotDate ? 1 : 0.5
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
      <CardFooter className="overview-card-footer">
        <span className="chart-legend">
          <span />
          {series[shown].heading}
        </span>
        <Button
          variant="ghost"
          size="sm"
          aria-pressed={showData}
          onClick={() => setShowData(!showData)}
        >
          {showData ? "Show chart" : "Show data"}
        </Button>
      </CardFooter>
    </Card>
  )
}
