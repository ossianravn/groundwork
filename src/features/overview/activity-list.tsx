import type { ReactNode } from "react"
import { projectColorStyle } from "@/components/project-color"
import { Card, CardContent, CardHeader, CardTitle } from "@/kit/ui/card"
import { ScrollArea } from "@/kit/ui/scroll-area"
import { ActivityRow } from "@/components/activity-row"
import type { Activity, Member, Project } from "@/demo/model"
import type { ProjectLinkRenderer } from "./project-link"

/** How far back Overview's feed reaches; the Activity page has the rest. */
const recent = 20

/**
 * Overview's recent activity, newest first, in a region as tall as the
 * chart beside it. It scrolls on its own and fades an edge only while
 * more history lies past it; All activity, in the header, opens the
 * Activity page.
 */
export function ActivityList({
  activity,
  projects,
  members,
  renderProject,
  allActivityLink,
}: {
  activity: Activity[]
  projects: Project[]
  members: Member[]
  renderProject: ProjectLinkRenderer
  allActivityLink?: ReactNode
}) {
  const events = activity.slice(-recent).reverse()

  return (
    <Card id="activity" tabIndex={-1} className="activity-card">
      <CardHeader>
        <CardTitle>
          <h2>Recent activity</h2>
        </CardTitle>
        {allActivityLink}
      </CardHeader>
      <CardContent className="activity-body">
        {/* Base UI positions the scroll area itself, so a wrapper pins it. */}
        <div className="activity-viewport">
          <ScrollArea
            className="size-full"
            viewportProps={{
              className: "activity-scroller",
              tabIndex: 0,
              role: "region",
              "aria-label": "Recent workspace activity",
            }}
          >
            <ol className="activity-rows">
              {events.map((event) => {
                const member = members.find(
                  (item) => item.id === event.memberId,
                )

                const project = projects.find(
                  (item) => item.id === event.projectId,
                )

                if (!member || !project)
                  throw new Error(
                    `Activity ${event.id} has an unknown member or project`,
                  )

                return (
                  <ActivityRow
                    key={event.id}
                    person={member}
                    action={event.action}
                    project={renderProject(project, {
                      id: `activity-project-${event.id}`,
                      className: "activity-project-link",
                      style: projectColorStyle(project.color),
                      children: project.name,
                    })}
                    date={event.date}
                  />
                )
              })}
            </ol>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
