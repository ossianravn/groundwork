import { documentText } from "@/kit/rich-text/document"
import type { ReactNode } from "react"
import { MemberAvatar } from "@/kit/member-avatar"
import { Checkbox } from "@/kit/ui/checkbox"
import { ProjectDueDate } from "@/components/project-due-date"
import { ProjectMark } from "@/components/project-identity"
import { ProjectProgressBar } from "@/components/project-progress-bar"
import { ProjectStatus } from "@/components/project-status"
import type { Member, Project } from "@/demo/model"

/**
 * A project as a card (design-system.md, record cards): the mark, which a
 * checkbox replaces on hover or while selecting, and the name, which opens
 * the project and covers the whole card; status (left to the board's
 * columns) and due date on one line;
 * the description (cards density only); one progress bar; the owner. The
 * board uses the compact density, so a project looks the same in both.
 * The host supplies the container with the `project-card` class.
 */
export function ProjectCard({
  project,
  owner,
  title,
  density = "cards",
  selection,
  actions,
}: {
  project: Project
  owner: Member
  /** The name, as a link or button that opens the project. */
  title: ReactNode
  density?: "cards" | "board"
  selection?: { selected: boolean; onChange: (selected: boolean) => void }
  /** Card actions after the name, such as a menu. */
  actions?: ReactNode
}) {
  const percent = project.tasks
    ? Math.round((project.completedTasks / project.tasks) * 100)
    : 0

  const description = density === "cards" && documentText(project.description)
  const Heading = density === "cards" ? "h3" : "h4"

  return (
    <>
      <div className="project-card-head">
        <span className="project-card-lead">
          <ProjectMark color={project.color} />
          {selection && (
            <Checkbox
              aria-label={`Select ${project.name}`}
              checked={selection.selected}
              onCheckedChange={selection.onChange}
            />
          )}
        </span>
        <Heading className="project-card-title">{title}</Heading>
        {actions && <div className="project-card-actions">{actions}</div>}
      </div>
      <div className="project-card-meta">
        {/* On the board, the column names the status. */}
        {density === "cards" && <ProjectStatus status={project.status} />}
        <ProjectDueDate date={project.dueDate} />
      </div>
      {description && <p className="project-card-description">{description}</p>}
      <div className="project-card-progress">
        <ProjectProgressBar
          color={project.color}
          value={percent}
          label={`${project.name}: ${percent}% complete`}
        />
        <span>
          {project.completedTasks}/{project.tasks} · {percent}%
        </span>
      </div>
      <p className="project-card-owner">
        <span aria-hidden="true">
          <MemberAvatar member={owner} size="sm" />
        </span>
        <span>
          <span className="sr-only">Owner </span>
          {owner.name}
        </span>
      </p>
    </>
  )
}
