import { useState, type ReactNode } from "react"
import { ToggleGroup, ToggleGroupItem } from "@/kit/ui/toggle-group"
import type { Activity, Project } from "@/demo/model"
import { timelineRows } from "@/demo/project-timeline"
import { ProjectTimeline } from "./project-timeline"
import { ProjectCalendar } from "./project-calendar"

/** Timeline and Month share the filtered, sorted projects. */
export function ProjectTimelineView({
  projects,
  activity,
  referenceDate,
  renderName,
}: {
  projects: Project[]
  activity: Activity[]
  referenceDate: string
  renderName: (project: Project) => ReactNode
}) {
  const [mode, setMode] = useState<"timeline" | "month">("timeline")
  const [month, setMonth] = useState(referenceDate.slice(0, 7))

  return (
    <div className="project-timeline-view">
      <ToggleGroup
        aria-label="Timeline layout"
        variant="outline"
        size="sm"
        spacing={0}
        value={[mode]}
        onValueChange={(values) => {
          if (values[0] === "timeline" || values[0] === "month")
            setMode(values[0])
        }}
      >
        <ToggleGroupItem value="timeline">Timeline</ToggleGroupItem>
        <ToggleGroupItem value="month">Month</ToggleGroupItem>
      </ToggleGroup>
      {mode === "timeline" ? (
        <ProjectTimeline
          rows={timelineRows(projects, activity, referenceDate)}
          referenceDate={referenceDate}
          renderName={renderName}
        />
      ) : (
        <ProjectCalendar
          projects={projects}
          month={month}
          referenceDate={referenceDate}
          onMonthChange={setMonth}
          renderName={renderName}
        />
      )}
    </div>
  )
}
