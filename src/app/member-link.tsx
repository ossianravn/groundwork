import type { ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import { MemberHoverCard } from "@/features/team/member-hover-card"
import { roleLabels } from "@/demo/team"
import type { Member } from "@/demo/model"
import { defaultActivitySearch } from "./activity-search"
import { defaultProjectsSearch } from "./projects-search"
import { useDemoWorkspace } from "./workspace-context"

// A member's name that filters the current view to them, with a hover card
// summarising their role and work from the shared demo state.
export function MemberLink({
  member,
  view,
  className,
  children,
}: {
  member: Member
  /** The view the link filters: projects they own, or their activity. */
  view: "projects" | "activity"
  className?: string
  children: ReactNode
}) {
  const { demo } = useDemoWorkspace()

  const membership = demo.memberships.find(
    (entry) => entry.memberId === member.id,
  )

  const summary = {
    role: membership ? roleLabels[membership.role] : "Former member",
    email: membership?.email,
    projects: demo.projects.filter((project) => project.ownerId === member.id)
      .length,
    openTasks: demo.tasks.filter(
      (task) => task.assigneeId === member.id && !task.done,
    ).length,
  }

  const link =
    view === "projects" ? (
      <Link
        to="/app/demo/projects"
        search={(previous) => ({
          ...defaultProjectsSearch,
          ...previous,
          owner: [member.id],
          page: 1,
        })}
        className={className}
      />
    ) : (
      <Link
        to="/app/demo/activity"
        search={(previous) => ({
          ...defaultActivitySearch,
          ...previous,
          member: member.id,
        })}
        className={className}
      />
    )

  return (
    <MemberHoverCard member={member} summary={summary} link={link}>
      {children}
    </MemberHoverCard>
  )
}
