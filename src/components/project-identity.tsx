import type { Project, ProjectColor } from "@/demo/model"
import { projectColorStyle } from "./project-color"

/** The project's colour, beside its name wherever the project appears. */
export function ProjectMark({ color }: { color: ProjectColor }) {
  return (
    <span
      className="project-dot"
      style={projectColorStyle(color)}
      aria-hidden="true"
    />
  )
}

/** Names a related project in context, as coloured text rather than a pill. */
export function ProjectBadge({
  project,
}: {
  project: Pick<Project, "name" | "color">
}) {
  return (
    <span className="project-badge">
      <ProjectMark color={project.color} />
      {project.name}
    </span>
  )
}
