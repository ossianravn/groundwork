import { projectColorStyle } from "@/components/project-color"
import { useRef, useState, type ReactNode } from "react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/kit/ui/card"
import { Button } from "@/kit/ui/button"
import { ScrollArea } from "@/kit/ui/scroll-area"
import { ActivityRow } from "@/components/activity-row"
import type { Activity, Member, Project } from "@/demo/model"

interface ActivityListProps {
  activity: Activity[]
  projects: Project[]
  members: Member[]
  onSelectProject: (id: string) => void
  expansion?: { expanded: boolean; onChange: (expanded: boolean) => void }
  allActivityLink?: ReactNode
}

export function ActivityList({
  activity,
  projects,
  members,
  onSelectProject,
  expansion,
  allActivityLink,
}: ActivityListProps) {
  const [localExpanded, setLocalExpanded] = useState(false)
  const expanded = expansion?.expanded ?? localExpanded
  const setExpanded = expansion?.onChange ?? setLocalExpanded
  const viewport = useRef<HTMLDivElement>(null)
  const events = (expanded ? activity.slice() : activity.slice(-6)).reverse()

  return (
    <Card
      id="activity"
      tabIndex={-1}
      className="activity-card"
      data-expanded={expanded}
    >
      <CardHeader>
        <CardTitle>
          <h2>Recent activity</h2>
        </CardTitle>
        <span className="activity-count" role="status">
          {events.length} of {activity.length} events
        </span>
      </CardHeader>
      <CardContent className="activity-body">
        <div className="activity-viewport">
          <ScrollArea
            className="size-full"
            viewportProps={{
              ref: viewport,
              id: "activity-history",
              className: "activity-scroller",
              tabIndex: 0,
              role: "region",
              "aria-label": expanded
                ? "All workspace activity"
                : "Latest workspace activity",
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
          </ScrollArea>
        </div>
      </CardContent>
      <CardFooter className="overview-card-footer">
        {allActivityLink ??
          (activity.length > 6 && (
            <Button
              variant="ghost"
              size="sm"
              aria-expanded={expanded}
              aria-controls="activity-history"
              onClick={() => {
                setExpanded(!expanded)
                viewport.current?.scrollTo({ top: 0 })

                if (!expanded) viewport.current?.focus({ preventScroll: true })
              }}
            >
              {expanded ? "Show recent" : "Show all activity"}
            </Button>
          ))}
      </CardFooter>
    </Card>
  )
}
