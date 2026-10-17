import { projectColorStyle } from "@/components/project-color"
import type { ReactNode } from "react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/kit/ui/card"
import { ActivityRow } from "@/components/activity-row"
import type { Activity, Member, Project } from "@/demo/model"

/**
 * Overview's latest six events as plain rows, newest first, with a link to
 * the full Activity page; the card never scrolls on its own.
 */
export function ActivityList({
  activity,
  projects,
  members,
  onSelectProject,
  allActivityLink,
}: {
  activity: Activity[]
  projects: Project[]
  members: Member[]
  onSelectProject: (id: string) => void
  allActivityLink?: ReactNode
}) {
  const events = activity.slice(-6).reverse()

  return (
    <Card id="activity" tabIndex={-1} className="activity-card">
      <CardHeader>
        <CardTitle>
          <h2>Recent activity</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="activity-body">
        <ol className="activity-rows">
          {events.map((event) => {
            const member = members.find((item) => item.id === event.memberId)

            const project = projects.find((item) => item.id === event.projectId)

            if (!member || !project)
              throw new Error(
                `Activity ${event.id} has an unknown member or project`,
              )

            return (
              <ActivityRow
                key={event.id}
                person={member}
                action={event.action}
                project={
                  <button
                    type="button"
                    className="activity-project-link"
                    style={projectColorStyle(project.color)}
                    onClick={() => onSelectProject(project.id)}
                    id={`activity-project-${event.id}`}
                  >
                    {project.name}
                  </button>
                }
                date={event.date}
              />
            )
          })}
        </ol>
      </CardContent>
      {allActivityLink && (
        <CardFooter className="overview-card-footer">
          {allActivityLink}
        </CardFooter>
      )}
    </Card>
  )
}
