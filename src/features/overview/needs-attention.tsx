import type { ReactNode } from "react"
import { CircleAlert, CircleSlash, Clock, UserRoundX } from "lucide-react"
import { MemberAvatar } from "@/kit/member-avatar"
import { ProjectDueDate } from "@/components/project-due-date"
import { ProjectMark } from "@/components/project-identity"
import type { AttentionItem, AttentionState } from "@/demo/attention"
import type { Member } from "@/demo/model"
import type { ProjectLinkRenderer } from "./project-link"

const states: Record<
  AttentionState,
  { label: string; icon: typeof CircleAlert }
> = {
  overdue: { label: "Overdue", icon: CircleAlert },
  late: { label: "Running late", icon: Clock },
  stalled: { label: "Stalled", icon: CircleSlash },
  unowned: { label: "Unassigned work", icon: UserRoundX },
}

/**
 * Overview's work list: the active projects that need someone, most urgent
 * first. Each row names the project and why, then its state, owner and due
 * date in columns shared by every row; the Projects page has the full list.
 */
export function NeedsAttention({
  items,
  members,
  renderProject,
  allProjectsLink,
}: {
  items: AttentionItem[]
  members: Member[]
  renderProject: ProjectLinkRenderer
  allProjectsLink?: ReactNode
}) {
  return (
    <section
      id="projects"
      className="attention"
      aria-labelledby="attention-title"
      data-page-zone="section"
      tabIndex={-1}
    >
      <header className="attention-heading">
        <h2 id="attention-title">Needs attention</h2>
        {allProjectsLink}
      </header>
      {items.length ? (
        <ul className="attention-list">
          {items.map(({ project, state, reasons }) => {
            const owner = members.find(
              (member) => member.id === project.ownerId,
            )

            const { label, icon: Icon } = states[state]

            return (
              <li key={project.id} className="attention-row">
                <ProjectMark color={project.color} />
                <div className="attention-text">
                  {renderProject(project, {
                    id: `project-link-${project.id}`,
                    className: "attention-name",
                    children: project.name,
                  })}
                  <p>{reasons.join(" · ")}</p>
                </div>
                <span className="attention-state" data-state={state}>
                  <Icon aria-hidden="true" />
                  {label}
                </span>
                <span className="attention-owner">
                  {owner && (
                    <>
                      <span aria-hidden="true">
                        <MemberAvatar member={owner} size="sm" />
                      </span>
                      <span className="sr-only">Owner </span>
                      {owner.name}
                    </>
                  )}
                </span>
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
