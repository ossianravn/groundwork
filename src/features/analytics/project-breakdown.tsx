import { useMemo, type ReactNode } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/kit/ui/chart"
import { useChartTypography } from "@/kit/ui/use-chart-typography"
import type { CompletionGroup } from "@/demo/analytics"
import { BreakdownCard } from "./breakdown-card"

export function ProjectBreakdown({
  rows,
  colorFor,
  renderName,
  showData,
  onShowDataChange,
}: {
  rows: CompletionGroup[]
  /** Each bar takes its project's own hue. */
  colorFor: (row: CompletionGroup) => string
  renderName: (row: CompletionGroup) => ReactNode
  showData: boolean
  onShowDataChange: (show: boolean) => void
}) {
  const labels = useMemo(() => rows.map((row) => row.name), [rows])
  const { ref, fontSize, lineHeight } = useChartTypography(labels)

  return (
    <BreakdownCard
      title="By project"
      nameLabel="Project"
      rows={rows}
      renderName={renderName}
      showData={showData}
      onShowDataChange={onShowDataChange}
    >
      <div ref={ref} className="analytics-bars text-xs">
        <ChartContainer
          config={{
            completed: { label: "Completed tasks", color: "var(--chart-1)" },
          }}
          className="analytics-bar-plot"
          role="figure"
          aria-label="Completed tasks by project. Show data provides values and project links."
          style={{ height: Math.max(rows.length * lineHeight * 2.6, 200) }}
        >
          <BarChart
            accessibilityLayer
            data={rows}
            layout="vertical"
            margin={{ left: 0, right: 28, top: 4, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 4" />
            <XAxis
              type="number"
              allowDecimals={false}
              fontSize={fontSize}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width="auto"
              fontSize={fontSize}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="completed"
              fill="var(--color-completed)"
              radius={999}
              maxBarSize={14}
              isAnimationActive={false}
            >
              {rows.map((row) => (
                <Cell key={row.id} fill={colorFor(row)} />
              ))}
              <LabelList
                dataKey="completed"
                position="right"
                fontSize={fontSize}
                className="fill-foreground"
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </BreakdownCard>
  )
}
