import { useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/kit/ui/chart"
import { ChartDataTable } from "@/kit/ui/chart-data-table"
import { ChartTotal } from "@/kit/ui/chart-header"
import { ChartSeriesToggle } from "@/kit/ui/chart-series"
import { hueColor } from "@/kit/ui/chart-colors"
import { useChartTypography } from "@/kit/ui/use-chart-typography"
import { openByMember } from "@/demo/workload"
import type { Member, Project, ProjectTask } from "@/demo/model"
import { AnalyticsChartCard } from "./analytics-chart-card"
import { inPaletteOrder } from "./palette-order"

/**
 * Who has the work: open tasks per person now, stacked by project
 * (shadcn's stacked horizontal bars). The legend hides projects to compare
 * the rest; unassigned work is its own row.
 */
export function MemberLoadChart({
  tasks,
  projects,
  members,
}: {
  tasks: ProjectTask[]
  projects: Project[]
  members: Member[]
}) {
  const [hidden, setHidden] = useState<string[]>([])

  const rows = useMemo(
    () => openByMember(tasks, projects, members),
    [tasks, projects, members],
  )

  const total = rows.reduce((sum, row) => sum + row.total, 0)
  const unassigned = rows.find((row) => !row.id)?.total ?? 0

  const open = inPaletteOrder(
    projects.filter((project) => rows.some((row) => row.projects[project.id])),
  )

  const data = rows.map((row) => ({
    name: row.name,
    total: row.total,
    ...row.projects,
  }))

  const labels = useMemo(() => rows.map((row) => row.name), [rows])
  const { ref, fontSize, lineHeight } = useChartTypography(labels)

  return (
    <AnalyticsChartCard
      label="Open tasks by person"
      empty={!total}
      heading={<ChartTotal as="h3" value={total} unit="open tasks" />}
      description={`Assigned now, across open projects${unassigned ? `; ${unassigned} unassigned` : ""}.`}
      legend={
        <ChartSeriesToggle
          label="Show projects"
          series={open.map((project) => ({
            key: project.id,
            label: project.name,
            color: hueColor(project.color),
          }))}
          hidden={hidden}
          onHiddenChange={setHidden}
        />
      }
      table={
        <ChartDataTable
          label="Open tasks by person data"
          className="chart-data-table"
          rows={rows}
          rowKey={(row) => row.id || "unassigned"}
          columns={[
            { key: "name", header: "Person", cell: (row) => row.name },
            ...open.map((project) => ({
              key: project.id,
              header: project.name,
              numeric: true,
              cell: (row: (typeof rows)[number]) =>
                row.projects[project.id] ?? 0,
            })),
            {
              key: "total",
              header: "Total",
              numeric: true,
              cell: (row) => row.total,
            },
          ]}
        />
      }
    >
      <div ref={ref} className="analytics-plot">
        <ChartContainer
          role="figure"
          className="analytics-plot-chart analytics-load-chart"
          config={Object.fromEntries(
            open.map((project) => [
              project.id,
              { label: project.name, color: hueColor(project.color) },
            ]),
          )}
          aria-label={`${total} open tasks across ${rows.length} people and unassigned work. Use Show data for each person's split.`}
          style={{
            height: Math.ceil(Math.max(rows.length * lineHeight * 2.8, 180)),
          }}
        >
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 0, right: 16, top: 4, bottom: 0 }}
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
            <ChartTooltip
              cursor={{ fill: "var(--muted)" }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            {open.map((project, index) => (
              <Bar
                key={project.id}
                dataKey={project.id}
                stackId="load"
                hide={hidden.includes(project.id)}
                fill={`var(--color-${project.id})`}
                stroke="var(--card)"
                strokeWidth={2}
                maxBarSize={18}
                radius={index === open.length - 1 ? [0, 4, 4, 0] : 0}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </div>
    </AnalyticsChartCard>
  )
}
