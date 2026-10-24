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
 * A project as a card (design-system.md, record cards), as in Trello: every
 * row is used to its end. The head holds the mark (a checkbox while
 * selecting), the name, which covers the card and opens it, any actions and
 * the owner; then the description (cards density only), one progress bar,
 * and a footer with status and due date at the start and the task count at
 * the end. The board uses the compact density and leaves the status to its
 * columns. The host supplies the container with the `project-card` class.
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
  /** Card actions before the owner, such as a menu. */
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
        <span className="project-card-owner" title={owner.name}>
          <span aria-hidden="true">
            <MemberAvatar member={owner} size="sm" />
          </span>
          <span className="sr-only">Owner {owner.name}</span>
        </span>
      </div>
      {density === "cards" && (
        <p className="project-card-description">
          {description || (
            <span className="text-muted-foreground">No description yet.</span>
          )}
        </p>
      )}
      <ProjectProgressBar
        color={project.color}
        value={percent}
        label={`${project.name}: ${percent}% complete`}
      />
      <div className="project-card-footer">
        {/* On the board, the column names the status. */}
        {density === "cards" && <ProjectStatus status={project.status} />}
        <ProjectDueDate date={project.dueDate} />
        <span className="project-card-count">
          {project.tasks ? (
            <>
              {project.completedTasks}/{project.tasks}
              <span aria-hidden="true"> · </span>
              <span className="sr-only">, </span>
              {percent}%
            </>
          ) : (
            "No tasks"
          )}
        </span>
      </div>
    </>
  )
}
