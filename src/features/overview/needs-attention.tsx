import type { ReactNode } from "react"
import { MemberAvatar } from "@/kit/member-avatar"
import { ProjectDueDate } from "@/components/project-due-date"
import { ProjectMark } from "@/components/project-identity"
import type { AttentionItem } from "@/demo/attention"
import type { Member } from "@/demo/model"

/**
 * Overview's work list: the active projects that need someone, each with
 * why (overdue, late at its pace, stalled, unowned work), its owner and due
 * date. A name opens the project; the Projects page has the full list.
 */
export function NeedsAttention({
  items,
  members,
  onSelectProject,
  allProjectsLink,
}: {
  items: AttentionItem[]
  members: Member[]
  onSelectProject: (id: string) => void
  allProjectsLink?: ReactNode
}) {
  return (
    <section
      id="projects"
      className="attention"
      aria-labelledby="attention-title"
      data-quick-view-list=""
      data-page-zone="section"
      tabIndex={-1}
    >
      <header className="attention-heading">
        <h2 id="attention-title">Needs attention</h2>
        {allProjectsLink}
      </header>
      {items.length ? (
        <ul className="attention-list">
          {items.map(({ project, reasons }) => {
            const owner = members.find(
              (member) => member.id === project.ownerId,
            )

            return (
              <li key={project.id} className="attention-row">
                <ProjectMark color={project.color} />
                <div className="attention-text">
                  <button
                    type="button"
                    id={`project-link-${project.id}`}
                    className="attention-name"
                    data-quick-view-id={project.id}
                    onClick={() => onSelectProject(project.id)}
                  >
                    {project.name}
                  </button>
                  <p>{reasons.join(" · ")}</p>
                </div>
                {owner && (
                  <span className="attention-owner" title={owner.name}>
                    <MemberAvatar member={owner} size="sm" />
                  </span>
                )}
                <ProjectDueDate date={project.dueDate} />
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-muted-foreground">
          Every active project is on track, with an owner for each task.
        </p>
      )}
    </section>
  )
}
