import type { ReactNode } from "react"
import { MemberAvatar, type AvatarPerson } from "@/kit/member-avatar"
import { formatDate } from "@/demo/model"

/**
 * One event in a feed: who did what, where, and when, as one sentence with
 * the date at the end of the row. Overview, a project's Activity tab and the
 * Activity page share it; a feed grouped under day headings leaves out
 * `date`.
 */
export function ActivityRow({
  person,
  name,
  action,
  project,
  date,
  trailing,
}: {
  person: AvatarPerson
  /** The name as shown, such as a link with a hover card. */
  name?: ReactNode
  action: ReactNode
  /** The project the event belongs to, usually a link after its mark. */
  project?: ReactNode
  date?: string
  /** A row action after the date, such as event details. */
  trailing?: ReactNode
}) {
  return (
    <li className="activity-row">
      <span aria-hidden="true">
        <MemberAvatar member={person} size="sm" />
      </span>
      <p className="activity-row-text">
        <span className="activity-row-name">{name ?? person.name}</span>{" "}
        {action}
        {project && <> {project}</>}
      </p>
      {date && (
        <time className="activity-row-date" dateTime={date}>
          {formatDate(date)}
        </time>
      )}
      {trailing}
    </li>
  )
}
