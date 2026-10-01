import { Pie, PieChart } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/kit/ui/chart"
import { ChartDataTable } from "@/kit/ui/chart-data-table"
import {
  projectStatuses,
  statusLabels,
  type Project,
  type ProjectStatus,
} from "@/demo/model"
import { AnalyticsChartCard } from "./analytics-chart-card"

// Status is state, so it takes the reserved status colours, not a series.
const colors: Record<ProjectStatus, string> = {
  "in-progress": "var(--in-progress)",
  "in-review": "var(--warning)",
  completed: "var(--success)",
}

/**
 * What state the portfolio is in: projects by status as a donut with the
 * total in its centre (shadcn's donut with text), and the counts beside it.
 */
export function StatusBreakdown({ projects }: { projects: Project[] }) {
  const rows = projectStatuses.map((status) => ({
    status,
    name: statusLabels[status],
    count: projects.filter((project) => project.status === status).length,
    fill: colors[status],
  }))

  const shown = rows.filter((row) => row.count)

  const open = projects.filter(
    (project) => project.status !== "completed",
  ).length

  return (
    <AnalyticsChartCard
      label="Projects by status"
      empty={!projects.length}
      heading={
        <h3 className="font-heading text-base font-semibold">
          Projects by status
        </h3>
      }
      description={`${open} open, ${projects.length - open} completed.`}
      table={
        <ChartDataTable
          label="Projects by status data"
          className="chart-data-table"
          rows={rows}
          rowKey={(row) => row.status}
          columns={[
            { key: "status", header: "Status", cell: (row) => row.name },
            {
              key: "count",
              header: "Projects",
              numeric: true,
              cell: (row) => row.count,
            },
          ]}
        />
      }
    >
      <div className="analytics-contributors">
        <div className="analytics-donut">
          <ChartContainer
            config={{ count: { label: "Projects" } }}
            className="analytics-donut-plot"
            role="figure"
            aria-label={`${projects.length} projects by status. Counts follow the chart.`}
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="name" hideLabel />}
              />
              <Pie
                data={shown}
                dataKey="count"
                nameKey="name"
                innerRadius="65%"
                outerRadius="90%"
                stroke="var(--card)"
                strokeWidth={2}
                isAnimationActive={false}
              />
            </PieChart>
          </ChartContainer>
          <div className="analytics-donut-total" aria-hidden="true">
            <strong>{projects.length}</strong>
            <span>projects</span>
          </div>
        </div>
        <ul className="analytics-legend" aria-label="Projects by status">
          {rows.map((row) => (
            <li key={row.status}>
              <span
                className="analytics-swatch"
                style={{ background: row.fill }}
                aria-hidden="true"
              />
              <span>{row.name}</span>
              <strong>{row.count}</strong>
            </li>
          ))}
        </ul>
      </div>
    </AnalyticsChartCard>
  )
}
