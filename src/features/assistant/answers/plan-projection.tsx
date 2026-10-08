import { useMemo, type CSSProperties } from "react"
import { CartesianGrid, Line, LineChart, ReferenceLine, YAxis } from "recharts"
import type { AnswerComponentProps } from "@/kit/answer/answer-library"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/kit/ui/chart"
import { ChartDataTable } from "@/kit/ui/chart-data-table"
import { ChartTotal } from "@/kit/ui/chart-header"
import { useChartTypography } from "@/kit/ui/use-chart-typography"
import { formatDate } from "@/demo/model"
import { dateOffset, windowDates } from "@/demo/report-period"
import type { PlanViewProps } from "@/demo/assistant/plan-schemas"
import { AnalyticsChartCard } from "@/features/analytics/analytics-chart-card"
import { CompletionDateAxis } from "@/features/overview/completion-date-axis"
import { usePlan } from "./plan-context"

interface Row {
  date: string
  done?: number
  scope?: number
  plan?: number
  assigned?: number
}

const day = (date: string | null) => (date ? formatDate(date) : "unknown")

/** A straight line from today's count to `to` on `finish`, then level. */
function toward(
  from: number,
  to: number,
  start: string,
  finish: string | null,
) {
  const span = finish ? Math.max(1, daysFrom(start, finish)) : 0

  return (date: string) =>
    finish && date <= finish
      ? Math.round(from + ((to - from) * daysFrom(start, date)) / span)
      : to
}

function daysFrom(from: string, to: string) {
  return Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
      86_400_000,
  )
}

/**
 * The plan's burn-up: done and scope so far, then where completions head
 * with the plan (solid, moving as the plan changes) and as assigned now
 * (dashed), against the due date.
 */
export function PlanProjection({ props }: AnswerComponentProps<PlanViewProps>) {
  const view = usePlan()

  const rows = useMemo(() => {
    if (!view) return []

    const { plan, outcome, assigned } = view
    const reference = plan.referenceDate
    const last = plan.history.at(-1)
    const done = last?.done ?? 0
    const start = plan.history[0]?.date ?? reference

    const horizon = [plan.dueDate, outcome.finish, assigned.finish]
      .flatMap((date) => (date ? [date] : []))
      .reduce((latest, date) => (date > latest ? date : latest), reference)

    const end = [dateOffset(horizon, 2), dateOffset(reference, 60)].sort()[0]
    const known = new Map(plan.history.map((point) => [point.date, point]))

    const withPlan = toward(
      done,
      done + outcome.remaining,
      reference,
      outcome.finish,
    )

    const asAssigned = toward(
      done,
      done + assigned.remaining,
      reference,
      assigned.finish,
    )

    return windowDates({ start, end: end ?? horizon }).map((date): Row => {
      const point = known.get(date)

      if (date < reference)
        return { date, done: point?.done, scope: point?.scope }

      // Today joins what happened to where the plan heads.
      const today = date === reference

      return {
        date,
        done: today ? done : undefined,
        scope: today ? last?.scope : undefined,
        plan: withPlan(date),
        assigned: asAssigned(date),
      }
    })
  }, [view])

  const dates = useMemo(() => rows.map((row) => row.date), [rows])
  const labels = useMemo(() => dates.map((date) => formatDate(date)), [dates])

  const { ref, fontSize, lineHeight, fontFamily, labelWidth } =
    useChartTypography(labels)

  if (!view) return null

  const { plan, outcome, assigned } = view

  const keyStyle: CSSProperties & Record<"--key-color", string> = {
    "--key-color": "var(--brand)",
  }

  return (
    <AnalyticsChartCard
      label={props.title ?? "Projection"}
      className="answer-plan-chart"
      heading={
        <ChartTotal as="h3" value={day(outcome.finish)} unit="with this plan" />
      }
      description={`As assigned ${day(assigned.finish)} · due ${day(plan.dueDate)}${outcome.unowned ? ` · ${outcome.unowned} without an owner, not counted` : ""}`}
      legend={
        <span className="analytics-legend-row">
          <span className="analytics-line-key" style={keyStyle}>
            <span aria-hidden="true" />
            With this plan
          </span>
          <span className="analytics-line-key" data-variant="projected">
            <span aria-hidden="true" />
            As assigned
          </span>
          <span className="analytics-line-key" data-variant="scope">
            <span aria-hidden="true" />
            Scope
          </span>
        </span>
      }
      table={
        <ChartDataTable
          label={`${plan.projectName} projection data`}
          className="chart-data-table"
          rows={rows}
          rowKey={(row) => row.date}
          columns={[
            {
              key: "date",
              header: "Date",
              cell: (row) => formatDate(row.date),
            },
            {
              key: "done",
              header: "Done",
              numeric: true,
              cell: (row) => row.done ?? "—",
            },
            {
              key: "plan",
              header: "With this plan",
              numeric: true,
              cell: (row) => row.plan ?? "—",
            },
            {
              key: "assigned",
              header: "As assigned",
              numeric: true,
              cell: (row) => row.assigned ?? "—",
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
            done: { label: "Done", color: "var(--brand)" },
            scope: { label: "Scope", color: "var(--muted-foreground)" },
            plan: { label: "With this plan", color: "var(--brand)" },
            assigned: {
              label: "As assigned",
              color: "var(--muted-foreground)",
            },
          }}
          aria-label={`${plan.projectName}: with this plan it finishes ${day(outcome.finish)}; as assigned ${day(assigned.finish)}; due ${day(plan.dueDate)}. Use Show data for daily values.`}
        >
          <LineChart
            data={rows}
            margin={{ left: 0, right: 16, top: 16, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 4" />
            <CompletionDateAxis
              dates={dates}
              format={(date) => formatDate(date)}
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
                  labelFormatter={(value) => formatDate(String(value))}
                />
              }
            />
            <ReferenceLine
              x={plan.dueDate}
              stroke="var(--foreground)"
              strokeDasharray="2 3"
              label={{
                value: "Due",
                position: "insideTopRight",
                fontSize,
                fill: "var(--muted-foreground)",
              }}
            />
            <Line
              dataKey="scope"
              type="stepAfter"
              stroke="var(--color-scope)"
              strokeWidth={1.5}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
            <Line
              dataKey="done"
              type="monotone"
              stroke="var(--color-done)"
              strokeWidth={2}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
            <Line
              dataKey="assigned"
              type="linear"
              stroke="var(--color-assigned)"
              strokeWidth={1.5}
              strokeDasharray="5 4"
              dot={false}
              isAnimationActive={false}
            />
            <Line
              dataKey="plan"
              type="linear"
              stroke="var(--color-plan)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </AnalyticsChartCard>
  )
}
