import type { ReactElement, ReactNode } from "react"
import { MemberAvatar } from "@/kit/member-avatar"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/kit/ui/hover-card"
import type { Member } from "@/demo/model"

export interface MemberSummary {
  role: string
  email?: string
  projects: number
  openTasks: number
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`
}

// A person's name as a link (the host decides where it leads, usually the
// current view filtered to them) with a preview card on hover or focus.
// The card repeats nothing the page depends on.
export function MemberHoverCard({
  member,
  summary,
  link,
  children,
}: {
  member: Member
  summary: MemberSummary
  /** The link element the name renders as; it receives the children. */
  link: ReactElement
  children: ReactNode
}) {
  return (
    <HoverCard>
      <HoverCardTrigger render={link} delay={400} closeDelay={150}>
        {children}
      </HoverCardTrigger>
      <HoverCardContent align="start" className="member-card">
        <MemberAvatar member={member} size="lg" />
        <div className="member-card-identity">
          <p className="member-card-name">{member.name}</p>
          <p>
            {summary.role}
            {summary.email && ` · ${summary.email}`}
          </p>
        </div>
        <p className="member-card-work">
          Owns {plural(summary.projects, "project")} ·{" "}
          {plural(summary.openTasks, "open task")} assigned
        </p>
      </HoverCardContent>
    </HoverCard>
  )
}
