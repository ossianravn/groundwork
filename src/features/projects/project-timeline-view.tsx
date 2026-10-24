import { useState, type ReactNode } from "react"
import type { Activity, Project } from "@/demo/model"
import { timelineRows } from "@/demo/project-timeline"
import { ProjectTimeline } from "./project-timeline"
import { ProjectCalendar } from "./project-calendar"

/**
 * Timeline and Month share the filtered, sorted projects; the view controls
 * choose between them.
 */
export function ProjectTimelineView({
  layout,
  projects,
  activity,
  referenceDate,
  renderName,
}: {
  layout: "timeline" | "month"
  projects: Project[]
  activity: Activity[]
  referenceDate: string
  renderName: (project: Project) => ReactNode
}) {
  const [month, setMonth] = useState(referenceDate.slice(0, 7))

  return (
    <div className="project-timeline-view">
      {layout === "timeline" ? (
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
