import { ActivityRow } from "@/components/activity-row"
import type { Activity, Member } from "@/demo/model"
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
    <ol className="activity-rows" aria-label="Activity">
      {events.map((event) => {
        const member = members.find((item) => item.id === event.memberId)

        if (!member)
          throw new Error(`Activity ${event.id} has an unknown member`)

        return (
          <ActivityRow
            key={event.id}
            person={member}
            action={actionWithinProject(event.action)}
            date={event.date}
          />
        )
      })}
    </ol>
  )
}
