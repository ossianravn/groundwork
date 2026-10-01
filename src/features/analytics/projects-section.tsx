import { useState, type ReactNode } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"
import { hueColor } from "@/kit/ui/chart-colors"
import type { CompletionGroup } from "@/demo/analytics"
import type { Project, ProjectTask } from "@/demo/model"
import type { ReportWindow } from "@/demo/report-period"
import { BurnUpChart } from "./burn-up-chart"
import { OpenShareChart } from "./open-share-chart"
import { ProjectBreakdown } from "./project-breakdown"
import { StatusBreakdown } from "./status-breakdown"

/**
 * Projects: how each one is moving. A burn-up for the chosen project (the
 * page's project, or one picked here), completed work by project, the
 * portfolio by status and where open work sits.
 */
export function ProjectsSection({
  projects,
  tasks,
  projectId,
  range,
  referenceDate,
  completed,
  previous,
  renderProject,
  showData,
  onShowDataChange,
}: {
  projects: Project[]
  tasks: ProjectTask[]
  /** The page's project filter; empty for all projects. */
  projectId: string
  range: ReportWindow
  referenceDate: string
  completed: CompletionGroup[]
  previous?: { label: string; counts: Record<string, number> }
  renderProject: (row: CompletionGroup) => ReactNode
  showData: boolean
  onShowDataChange: (show: boolean) => void
}) {
  // Open projects first, soonest due, so the default is the one to watch.
  const ordered = [...projects].sort(
    (a, b) =>
      Number(a.status === "completed") - Number(b.status === "completed") ||
      a.dueDate.localeCompare(b.dueDate),
  )

  const [picked, setPicked] = useState(ordered[0]?.id ?? "")
  const shown = projects.find((project) => project.id === (projectId || picked))

  return (
    <section className="analytics-section" aria-labelledby="analytics-projects">
      <header className="analytics-section-header">
        <h2 id="analytics-projects">Projects</h2>
        <p>How each project is moving, and where open work sits.</p>
      </header>
      {shown && (
        <BurnUpChart
          project={shown}
          tasks={tasks}
          referenceDate={referenceDate}
          picker={
            !projectId && (
              <Select
                items={ordered.map((project) => ({
                  value: project.id,
                  label: project.name,
                }))}
                value={shown.id}
                onValueChange={(value) => {
                  if (value) setPicked(value)
                }}
              >
                <SelectTrigger size="sm" aria-label="Burn-up project">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ordered.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )
          }
        />
      )}
      <div className="analytics-pair">
        <ProjectBreakdown
          rows={completed}
          colorFor={(row) => {
            const color = projects.find((item) => item.id === row.id)?.color

            return color ? hueColor(color) : "var(--muted-foreground)"
          }}
          renderName={renderProject}
          showData={showData}
          onShowDataChange={onShowDataChange}
          previous={previous}
        />
        <StatusBreakdown projects={projects} />
      </div>
      {!projectId && (
        <OpenShareChart tasks={tasks} projects={projects} range={range} />
      )}
    </section>
  )
}
