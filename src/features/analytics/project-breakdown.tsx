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
  previous,
}: {
  rows: CompletionGroup[]
  /** Last period's counts, drawn as a quieter bar beside each project. */
  previous?: { label: string; counts: Record<string, number> }
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
      previous={previous}
    >
      <div ref={ref} className="text-xs">
        <ChartContainer
          config={{
            completed: { label: "Completed tasks", color: "var(--chart-1)" },
          }}
          className="analytics-bar-plot"
          role="figure"
          aria-label="Completed tasks by project. Show data provides values and project links."
          // Whole pixels: Recharts rounds its wrapper up, so a fractional
          // height would overflow the plot by a sub-pixel.
          style={{
            height: Math.ceil(
              Math.max(rows.length * lineHeight * (previous ? 3.6 : 2.6), 200),
            ),
          }}
        >
          <BarChart
            accessibilityLayer
            data={rows.map((row) => ({
              ...row,
              previous: previous?.counts[row.id] ?? 0,
            }))}
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
            {previous && (
              <Bar
                dataKey="previous"
                name={previous.label}
                fill="var(--muted-foreground)"
                fillOpacity={0.35}
                radius={999}
                maxBarSize={8}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="previous"
                  position="right"
                  fontSize={fontSize}
                  className="fill-muted-foreground"
                />
              </Bar>
            )}
          </BarChart>
        </ChartContainer>
      </div>
    </BreakdownCard>
  )
}
