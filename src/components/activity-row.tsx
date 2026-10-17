import type { ReactNode } from "react"
import { MemberAvatar, type AvatarPerson } from "@/kit/member-avatar"
import { formatDate } from "@/demo/model"

/**
 * One event in a feed: who did what, where, and when, as one sentence with
 * the date at the end of the row. Overview, a project's Activity tab and the
 * Activity page share it. With `details`, the date opens the event, as a
 * timestamp does in a chat or code review.
 */
export function ActivityRow({
  person,
  name,
  action,
  project,
  date,
  details,
}: {
  person: AvatarPerson
  /** The name as shown, such as a link with a hover card. */
  name?: ReactNode
  action: ReactNode
  /** The project the event belongs to, usually a link after its mark. */
  project?: ReactNode
  date?: string
  /** Makes the date a button that opens the event; `label` names it. */
  details?: { id?: string; label: string; onOpen: () => void }
}) {
  const time = date && (
    <time className="activity-row-date" dateTime={date}>
      {formatDate(date)}
    </time>
  )

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
      {time && details ? (
        <button
          type="button"
          id={details.id}
          className="activity-row-details"
          aria-haspopup="dialog"
          aria-label={details.label}
          onClick={details.onOpen}
        >
          {time}
        </button>
      ) : (
        time
      )}
    </li>
  )
}
