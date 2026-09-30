import { Card, CardContent, CardHeader, CardTitle } from "@/kit/ui/card"
import { MemberAvatar } from "@/kit/member-avatar"
import { formatDate, type Activity, type Member } from "@/demo/model"
import { actionWithinProject } from "@/demo/activity"

/** A project's own activity, newest first, without repeating its name. */
export function ProjectActivity({
  events,
  members,
}: {
  events: Activity[]
  members: Member[]
}) {
  return (
    <Card className="project-activity">
      <CardHeader>
        <CardTitle>
          <h2>Activity</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length ? (
          <ol className="project-event-list">
            {events.map((event) => {
              const member = members.find((item) => item.id === event.memberId)

              if (!member)
                throw new Error(`Activity ${event.id} has an unknown member`)

              return (
                <li key={event.id}>
                  <MemberAvatar member={member} size="sm" />
                  <p>
                    <strong>{member.name}</strong>{" "}
                    {actionWithinProject(event.action)}
                  </p>
                  <time dateTime={event.date}>
                    {formatDate(event.date, { year: "numeric" })}
                  </time>
                </li>
              )
            })}
          </ol>
        ) : (
          <p className="text-muted-foreground">No activity yet.</p>
        )}
      </CardContent>
    </Card>
  )
}
