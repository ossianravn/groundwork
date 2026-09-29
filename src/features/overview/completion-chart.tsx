import { useMemo, useState, type ReactNode } from "react"
import { Bar, BarChart, CartesianGrid, Cell, YAxis } from "recharts"
import { CompletionDateAxis } from "./completion-date-axis"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/kit/ui/chart"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/kit/ui/card"
import { Button } from "@/kit/ui/button"
import { useChartTypography } from "@/kit/ui/use-chart-typography"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/kit/ui/table"
import { completionSeries } from "@/demo/selectors"
import { formatDate, type Activity } from "@/demo/model"
import type { ReportWindow } from "@/demo/report-period"

interface CompletionChartProps {
  activity: Activity[]
  /** The dates shown; the host's period control owns how they are chosen. */
  range: ReportWindow
  /** Drawn at full strength when the range includes it. */
  snapshotDate: string
  periodControl: ReactNode
}

export function CompletionChart({
  activity,
  range,
  snapshotDate,
  periodControl,
}: CompletionChartProps) {
  const [showData, setShowData] = useState(false)

  const series = useMemo(
    () => completionSeries(activity, range),
    [activity, range],
  )

  const dates = useMemo(() => series.map((day) => day.date), [series])
  const labels = useMemo(() => dates.map((date) => formatDate(date)), [dates])

  const {
    ref: chartBody,
    fontSize,
    lineHeight,
    fontFamily,
    labelWidth,
  } = useChartTypography(labels)

  const total = series.reduce((sum, day) => sum + day.completed, 0)
  const showsSnapshot = series.some((day) => day.date === snapshotDate)

  return (
    <Card className="completion-card">
      <CardHeader className="chart-header">
        <CardTitle>
          <h2 className="chart-heading">
            <span className="chart-total">{total}</span>{" "}
            <span>tasks completed</span>
          </h2>
        </CardTitle>
        <div className="chart-period">{periodControl}</div>
      </CardHeader>
      <CardContent ref={chartBody} className="chart-body text-xs">
        {showData ? (
          <div
            className="chart-data-table"
            tabIndex={0}
            role="region"
            aria-label="Daily task completion data"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">Date</TableHead>
                  <TableHead scope="col" className="text-right">
                    Completed tasks
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {series.map((day) => (
                  <TableRow key={day.date}>
                    <TableCell>{formatDate(day.date)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {day.completed}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <ChartContainer
            role="figure"
            className="completion-chart"
            config={{
              completed: { label: "Completed tasks", color: "var(--brand)" },
            }}
            aria-label={`${total} tasks completed from ${formatDate(range.start)} to ${formatDate(range.end, { year: "numeric" })}. Use Show data for daily values.`}
          >
            <BarChart
              accessibilityLayer
              data={series}
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
                dataKey="completed"
                fill="var(--color-completed)"
                radius={[3, 3, 0, 0]}
                maxBarSize={24}
                isAnimationActive={false}
              >
                {/* Earlier days recede so the snapshot day reads first; a
                    range without it keeps every day at full strength. */}
                {series.map((day) => (
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
          Completed tasks
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
