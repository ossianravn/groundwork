import { projectColorStyle } from "@/components/project-color"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { ArrowUpRight } from "lucide-react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/kit/ui/card"
import { Button } from "@/kit/ui/button"
import { MemberAvatar } from "@/kit/member-avatar"
import {
  formatDate,
  type Activity,
  type Member,
  type Project,
} from "@/demo/model"

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

  useEffect(() => {
    const region = viewport.current

    if (!region) return

    const updateFade = () => {
      const remaining =
        region.scrollHeight - region.clientHeight - region.scrollTop

      region.style.setProperty(
        "--scroll-before",
        `${Math.max(0, region.scrollTop)}px`,
      )
      region.style.setProperty(
        "--scroll-after",
        `${Math.max(0, Math.round(remaining))}px`,
      )
      region.style.setProperty(
        "--scroll-content-width",
        `${region.clientWidth}px`,
      )
    }

    const observer = new ResizeObserver(updateFade)
    observer.observe(region)

    if (region.firstElementChild) observer.observe(region.firstElementChild)
    region.addEventListener("scroll", updateFade, { passive: true })
    updateFade()

    return () => {
      observer.disconnect()
      region.removeEventListener("scroll", updateFade)
    }
  }, [])

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
        <div
          ref={viewport}
          id="activity-history"
          className="activity-viewport"
          tabIndex={0}
          role="region"
          aria-label={
            expanded ? "All workspace activity" : "Latest workspace activity"
          }
        >
          <ol className="activity-list">
            {events.map((event) => {
              const member = members.find((item) => item.id === event.memberId)

              const project = projects.find(
                (item) => item.id === event.projectId,
              )

              if (!member || !project)
                throw new Error(
                  `Activity ${event.id} has an unknown member or project`,
                )

              return (
                <li key={event.id}>
                  <MemberAvatar member={member} size="sm" />
                  <div className="min-w-0">
                    <p className="activity-copy">
                      <span className="font-medium text-foreground">
                        {member.name}
                      </span>{" "}
                      {event.action}{" "}
                      <Button
                        variant="link"
                        size="sm"
                        className="activity-project"
                        style={projectColorStyle(project.color)}
                        onClick={() => onSelectProject(project.id)}
                        id={`activity-project-${event.id}`}
                      >
                        {project.name}
                        <ArrowUpRight
                          data-icon="inline-end"
                          aria-hidden="true"
                        />
                      </Button>
                    </p>
                    <time
                      className="block text-xs text-muted-foreground"
                      dateTime={event.date}
                    >
                      {formatDate(event.date)}
                    </time>
                  </div>
                </li>
              )
            })}
          </ol>
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
