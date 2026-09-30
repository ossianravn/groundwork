import { MemberAvatar } from "@/kit/member-avatar"
import { formatDate, type Activity, type Member } from "@/demo/model"
import { actionWithinProject } from "@/demo/activity"

/**
 * A project's own activity, newest first, without repeating its name. The
 * page's Activity tab names it.
 */
export function ProjectActivity({
  events,
  members,
}: {
  events: Activity[]
  members: Member[]
}) {
  if (!events.length)
    return <p className="text-muted-foreground">No activity yet.</p>

  return (
    <ol className="project-event-list" aria-label="Activity">
      {events.map((event) => {
        const member = members.find((item) => item.id === event.memberId)

        if (!member)
          throw new Error(`Activity ${event.id} has an unknown member`)

        return (
          <li key={event.id}>
            <MemberAvatar member={member} size="sm" />
            <p>
              <strong>{member.name}</strong> {actionWithinProject(event.action)}
            </p>
            <time dateTime={event.date}>
              {formatDate(event.date, { year: "numeric" })}
            </time>
          </li>
        )
      })}
    </ol>
  )
}
