import { useMemo } from "react"
import { Area, AreaChart, CartesianGrid, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/kit/ui/chart"
import { ChartDataTable } from "@/kit/ui/chart-data-table"
import { hueColor } from "@/kit/ui/chart-colors"
import { useChartTypography } from "@/kit/ui/use-chart-typography"
import { CompletionDateAxis } from "@/features/overview/completion-date-axis"
import { openByWeek } from "@/demo/workload"
import { formatDate, type Project, type ProjectTask } from "@/demo/model"
import type { ReportWindow } from "@/demo/report-period"
import { AnalyticsChartCard } from "./analytics-chart-card"
import { inPaletteOrder } from "./palette-order"

const weekLabel = (date: string) => `w/e ${formatDate(date)}`

const percent = (value: number) => `${Math.round(value * 100)}%`

/**
 * Where open work sits: each project's share of the open tasks at the end
 * of every week (shadcn's stacked expanded area). A share that widens is
 * work piling up; the heading names the largest.
 */
export function OpenShareChart({
  tasks,
  projects,
  range,
}: {
  tasks: ProjectTask[]
  projects: Project[]
  range: ReportWindow
}) {
  const points = useMemo(() => openByWeek(tasks, range), [tasks, range])

  const dates = useMemo(
    () => points.map((point) => String(point.date)),
    [points],
  )

  const labels = useMemo(() => dates.map(weekLabel), [dates])

  const { ref, fontSize, lineHeight, fontFamily, labelWidth } =
    useChartTypography(labels)

  const shown = inPaletteOrder(
    projects.filter((project) => points.some((point) => point[project.id])),
  )

  const last = points.at(-1)
  const count = (project: Project) => Number(last?.[project.id] ?? 0)
  const open = shown.reduce((sum, project) => sum + count(project), 0)
  const largest = [...shown].sort((a, b) => count(b) - count(a))[0]

  return (
    <AnalyticsChartCard
      label="Open work by project"
      empty={!open}
      heading={
        <h3 className="font-heading text-base font-semibold">
          {largest
            ? `${largest.name} holds ${percent(count(largest) / open)} of open work`
            : "Open work by project"}
        </h3>
      }
      description={`${open} open tasks at ${formatDate(range.end)}, by the share each project held each week.`}
      legend={
        <span className="analytics-poles">
          {shown.map((project) => (
            <span key={project.id}>
              <span
                style={{ background: hueColor(project.color) }}
                aria-hidden="true"
              />
              {project.name}
            </span>
          ))}
        </span>
      }
      table={
        <ChartDataTable
          label="Open work by project data"
          className="chart-data-table"
          rows={points}
          rowKey={(point) => String(point.date)}
          columns={[
            {
              key: "date",
              header: "Week ending",
              cell: (point) => formatDate(String(point.date)),
            },
            ...shown.map((project) => ({
              key: project.id,
              header: project.name,
              numeric: true,
              cell: (point: (typeof points)[number]) =>
                Number(point[project.id] ?? 0),
            })),
          ]}
        />
      }
    >
      <div ref={ref} className="analytics-plot">
        <ChartContainer
          role="figure"
          className="analytics-plot-chart"
          config={Object.fromEntries(
            shown.map((project) => [
              project.id,
              { label: project.name, color: hueColor(project.color) },
            ]),
          )}
          aria-label={`Share of open tasks by project, weekly. ${largest ? `${largest.name} holds the most now.` : ""} Use Show data for counts.`}
        >
          <AreaChart
            data={points}
            stackOffset="expand"
            margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 4" />
            <CompletionDateAxis
              dates={dates}
              format={weekLabel}
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
              tickFormatter={percent}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(value) => weekLabel(String(value))}
                />
              }
            />
            {shown.map((project) => (
              <Area
                key={project.id}
                dataKey={project.id}
                stackId="open"
                type="monotone"
                stroke={`var(--color-${project.id})`}
                strokeWidth={1.5}
                fill={`var(--color-${project.id})`}
                fillOpacity={0.55}
                isAnimationActive={false}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </div>
    </AnalyticsChartCard>
  )
}
