import { Badge } from "@/kit/ui/badge"
import type { Project } from "@/demo/model"

export function ProjectMark({ code }: { code: string }) {
  return (
    <span className="project-monogram" aria-hidden="true">
      {code}
    </span>
  )
}

export function ProjectBadge({ project }: { project: Pick<Project, "name"> }) {
  return (
    <Badge variant="outline" className="project-badge">
      <span>{project.name}</span>
    </Badge>
  )
}
