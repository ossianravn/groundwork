import { useState } from "react"
import { Pie, PieChart } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/kit/ui/chart"
import type { CompletionGroup } from "@/demo/analytics"
import type { Member } from "@/demo/model"
import { BreakdownCard } from "./breakdown-card"
import { maxSeries, seriesColor } from "@/kit/ui/chart-colors"

export function ContributorBreakdown({
  rows,
  people,
}: {
  rows: CompletionGroup[]
  people: Member[]
}) {
  const [showData, setShowData] = useState(false)

  const memberColor = (index: number) =>
    index >= 0 && index < maxSeries
      ? seriesColor(index)
      : "var(--muted-foreground)"

  const data = rows.map((row) => ({
    ...row,
    // Colour follows the person's place in the workspace, never their rank;
    // anyone past the palette (a former member) reads as Other.
    fill: memberColor(people.findIndex((person) => person.id === row.id)),
  }))

  const total = rows.reduce((sum, row) => sum + row.completed, 0)

  return (
    <BreakdownCard
      title="By contributor"
      nameLabel="Contributor"
      rows={rows}
      renderName={(row) => row.name}
      showData={showData}
      onShowDataChange={setShowData}
    >
      <div className="analytics-contributors">
        <div className="analytics-donut">
          <ChartContainer
            config={{ completed: { label: "Completed tasks" } }}
            className="analytics-donut-plot"
            role="figure"
            aria-label={`${total} completed tasks by contributor. Values follow the chart.`}
          >
            <PieChart accessibilityLayer>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie
                data={data}
                dataKey="completed"
                nameKey="name"
                innerRadius="65%"
                outerRadius="90%"
                strokeWidth={2}
                isAnimationActive={false}
              />
            </PieChart>
          </ChartContainer>
          <div className="analytics-donut-total" aria-hidden="true">
            <strong>{total}</strong>
            <span>tasks</span>
          </div>
        </div>
        <ul className="analytics-legend" aria-label="Contributor totals">
          {data.map((row) => (
            <li key={row.id}>
              <span
                className="analytics-swatch"
                style={{ background: row.fill }}
                aria-hidden="true"
              />
              <span>{row.name}</span>
              <strong>{row.completed}</strong>
            </li>
          ))}
        </ul>
      </div>
    </BreakdownCard>
  )
}
