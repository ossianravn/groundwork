import { useState } from "react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/kit/ui/chart"
import { ChartDataTable } from "@/kit/ui/chart-data-table"
import { maxSeries, seriesColor } from "@/kit/ui/chart-colors"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"
import { workByTag } from "@/demo/workload"
import type { Activity, Member, Project } from "@/demo/model"
import type { ReportWindow } from "@/demo/report-period"
import { AnalyticsChartCard } from "./analytics-chart-card"

function MemberSelect({
  label,
  value,
  members,
  onChange,
}: {
  label: string
  value: string
  members: Member[]
  onChange: (id: string) => void
}) {
  return (
    <Select
      items={members.map((member) => ({
        value: member.id,
        label: member.name,
      }))}
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next)
      }}
    >
      <SelectTrigger size="sm" aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {members.map((member) => (
          <SelectItem key={member.id} value={member.id}>
            {member.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/**
 * How two people's completed work spreads across the kinds of project they
 * worked on, by project tag (shadcn's multiple radar). Two shapes compare
 * profiles, not totals; the table gives the counts.
 */
export function MemberCompareChart({
  activity,
  projects,
  members,
  people,
  range,
}: {
  activity: Activity[]
  projects: Project[]
  members: Member[]
  /** Everyone in history, whose order sets each person's colour. */
  people: Member[]
  range: ReportWindow
}) {
  const [pair, setPair] = useState<[string, string]>([
    members[0]?.id ?? "",
    members[1]?.id ?? "",
  ])

  const rows = workByTag(activity, projects, pair, range)

  const names = pair.map(
    (id) => people.find((person) => person.id === id)?.name ?? "Former member",
  )

  // Totals come from Activity: a project with two tags counts in both
  // spokes, so summing the spokes would double-count.
  const totals = pair.map((id) =>
    activity
      .filter(
        (event) =>
          event.memberId === id &&
          event.date >= range.start &&
          event.date <= range.end,
      )
      .reduce((sum, event) => sum + event.tasksCompleted, 0),
  )

  // A person keeps the colour the contributor chart gives them.
  const colors = pair.map((id) => {
    const index = people.findIndex((person) => person.id === id)

    return index >= 0 && index < maxSeries
      ? seriesColor(index)
      : "var(--muted-foreground)"
  })

  return (
    <AnalyticsChartCard
      label="Compare people"
      empty={!totals[0] && !totals[1]}
      heading={
        <h3 className="font-heading text-base font-semibold">Compare people</h3>
      }
      description={`Tasks completed in the period by project tag (${names[0]} ${totals[0]}, ${names[1]} ${totals[1]}). A project with two tags counts in both.`}
      legend={
        <span className="analytics-legend-row">
          <span className="analytics-pick" style={{ color: colors[0] }}>
            <span aria-hidden="true" />
            <MemberSelect
              label="First person"
              value={pair[0]}
              members={members.filter((member) => member.id !== pair[1])}
              onChange={(id) => setPair([id, pair[1]])}
            />
          </span>
          <span className="analytics-pick" style={{ color: colors[1] }}>
            <span aria-hidden="true" />
            <MemberSelect
              label="Second person"
              value={pair[1]}
              members={members.filter((member) => member.id !== pair[0])}
              onChange={(id) => setPair([pair[0], id])}
            />
          </span>
        </span>
      }
      table={
        <ChartDataTable
          label="Compare people data"
          className="chart-data-table"
          rows={rows}
          rowKey={(row) => String(row.tag)}
          columns={[
            {
              key: "tag",
              header: "Project tag",
              cell: (row) => String(row.tag),
            },
            {
              key: "a",
              header: names[0],
              numeric: true,
              cell: (row) => Number(row[pair[0]]),
            },
            {
              key: "b",
              header: names[1],
              numeric: true,
              cell: (row) => Number(row[pair[1]]),
            },
          ]}
        />
      }
    >
      <ChartContainer
        role="figure"
        className="analytics-plot-chart analytics-radar"
        config={{
          [pair[0]]: { label: names[0], color: colors[0] },
          [pair[1]]: { label: names[1], color: colors[1] },
        }}
        aria-label={`${names[0]} completed ${totals[0]} tasks and ${names[1]} ${totals[1]}, by project tag. Use Show data for each tag.`}
      >
        <RadarChart data={rows} outerRadius="72%">
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="tag"
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          {pair.map((id) => (
            <Radar
              key={id}
              dataKey={id}
              stroke={`var(--color-${id})`}
              strokeWidth={2}
              fill={`var(--color-${id})`}
              fillOpacity={0.15}
              dot={{ r: 3, fillOpacity: 1 }}
              isAnimationActive={false}
            />
          ))}
        </RadarChart>
      </ChartContainer>
    </AnalyticsChartCard>
  )
}
