import { useMemo, type CSSProperties, type ReactNode } from "react"
import { CartesianGrid, Line, LineChart, ReferenceLine, YAxis } from "recharts"
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
import { burnUp } from "@/demo/workload"
import { formatDate, type Project, type ProjectTask } from "@/demo/model"
import { AnalyticsChartCard } from "./analytics-chart-card"

const dayLabel = (date: string) => formatDate(date)

/** Will it land on time? The heading answers from the projection. */
function outlook(project: Project, finish: string | null | undefined) {
  if (project.status === "completed") return "Completed"

  if (finish === undefined) return "All tasks done"

  if (finish === null) return "No progress in the last two weeks"

  return finish <= project.dueDate
    ? `On track to finish ${formatDate(finish)}`
    : `At this pace it finishes ${formatDate(finish)}`
}

/**
 * A project's burn-up (shadcn's multiple-line chart): scope as a step line,
 * completed work rising toward it, and a dashed projection at the last two
 * weeks' pace to the due date, marked by a line.
 */
export function BurnUpChart({
  project,
  tasks,
  referenceDate,
  picker,
  className,
}: {
  project: Project
  tasks: ProjectTask[]
  referenceDate: string
  /** A project picker in the header, when the host offers one. */
  picker?: ReactNode
  className?: string
}) {
  const { points, finish } = useMemo(
    () => burnUp(tasks, project, referenceDate),
    [tasks, project, referenceDate],
  )

  const dates = useMemo(() => points.map((point) => point.date), [points])
  const labels = useMemo(() => dates.map(dayLabel), [dates])

  const { ref, fontSize, lineHeight, fontFamily, labelWidth } =
    useChartTypography(labels)

  const color = hueColor(project.color)

  const keyStyle: CSSProperties & Record<"--key-color", string> = {
    "--key-color": color,
  }

  const heading = outlook(project, finish)
  const late = !!finish && finish > project.dueDate

  return (
    <AnalyticsChartCard
      label={`${project.name} burn-up`}
      className={["analytics-burn-up", className].filter(Boolean).join(" ")}
      empty={!points.length}
      heading={
        <ChartTotal
          as="h3"
          value={`${project.completedTasks}/${project.tasks}`}
          unit="tasks done"
        />
      }
      description={`${heading}${late ? `, after its ${formatDate(project.dueDate)} due date` : ""}.`}
      controls={picker}
      legend={
        <span className="analytics-legend-row">
          <span className="analytics-line-key" style={keyStyle}>
            <span aria-hidden="true" />
            Done
          </span>
          <span className="analytics-line-key" data-variant="scope">
            <span aria-hidden="true" />
            Scope
          </span>
          {project.status !== "completed" && (
            <span
              className="analytics-line-key"
              data-variant="projected"
              style={keyStyle}
            >
              <span aria-hidden="true" />
              Projected
            </span>
          )}
        </span>
      }
      table={
        <ChartDataTable
          label={`${project.name} burn-up data`}
          className="chart-data-table"
          rows={points}
          rowKey={(point) => point.date}
          columns={[
            {
              key: "date",
              header: "Date",
              cell: (point) => dayLabel(point.date),
            },
            {
              key: "scope",
              header: "Scope",
              numeric: true,
              cell: (point) => point.scope ?? "—",
            },
            {
              key: "done",
              header: "Done",
              numeric: true,
              cell: (point) => point.done ?? "—",
            },
            {
              key: "projected",
              header: "Projected",
              numeric: true,
              cell: (point) => point.projected ?? "—",
            },
          ]}
        />
      }
    >
      <div ref={ref} className="analytics-plot">
        <ChartContainer
          role="figure"
          className="analytics-plot-chart"
          config={{
            scope: { label: "Scope", color: "var(--muted-foreground)" },
            done: { label: "Done", color },
            projected: { label: "Projected", color },
          }}
          aria-label={`${project.name}: ${project.completedTasks} of ${project.tasks} tasks done. ${heading}. Due ${formatDate(project.dueDate)}. Use Show data for daily values.`}
        >
          <LineChart
            data={points}
            margin={{ left: 0, right: 16, top: 16, bottom: 0 }}
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
            {dates.includes(project.dueDate) && (
              <ReferenceLine
                x={project.dueDate}
                stroke="var(--foreground)"
                strokeDasharray="2 3"
                label={{
                  value: "Due",
                  position: "insideTopRight",
                  fontSize,
                  fill: "var(--muted-foreground)",
                }}
              />
            )}
            <Line
              dataKey="scope"
              type="stepAfter"
              stroke="var(--color-scope)"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="done"
              type="monotone"
              stroke="var(--color-done)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="projected"
              type="linear"
              stroke="var(--color-projected)"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </AnalyticsChartCard>
  )
}
