import { ArrowUpRight } from "lucide-react"
import { Badge } from "@/kit/ui/badge"
import type { Project, ProjectLink } from "@/demo/model"

export function ProjectTags({ tags }: { tags: string[] }) {
  return (
    <ul className="project-tags" aria-label="Tags">
      {tags.map((tag) => (
        <li key={tag}>
          <Badge variant="secondary">{tag}</Badge>
        </li>
      ))}
    </ul>
  )
}

export function ProjectLinks({ links }: { links: ProjectLink[] }) {
  return (
    <ul className="project-links">
      {links.map((link) => (
        <li key={link.id}>
          <a href={link.url} target="_blank" rel="noopener noreferrer">
            <span>{link.label || link.url}</span>
            <ArrowUpRight aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  )
}

export function ProjectResources({
  project,
}: {
  project: Pick<Project, "tags" | "links">
}) {
  if (!project.tags.length && !project.links.length) return null

  return (
    <dl className="project-resources">
      {project.tags.length > 0 && (
        <div>
          <dt>Tags</dt>
          <dd>
            <ProjectTags tags={project.tags} />
          </dd>
        </div>
      )}
      {project.links.length > 0 && (
        <div>
          <dt>Related links</dt>
          <dd>
            <ProjectLinks links={project.links} />
          </dd>
        </div>
      )}
    </dl>
  )
}
