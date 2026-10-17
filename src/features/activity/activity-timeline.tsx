import type { ReactNode } from "react"
import { Info } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { ActivityRow } from "@/components/activity-row"
import {
  formatDate,
  type Activity,
  type Member,
  type Project,
} from "@/demo/model"

export function ActivityTimeline({
  events,
  people,
  projects,
  renderProject,
  renderPerson = (person) => person.name,
  onDetails,
}: {
  events: Activity[]
  people: Member[]
  projects: Project[]
  renderProject: (project: Project, eventId: string) => ReactNode
  /** A known person's name, such as a link with a hover card. */
  renderPerson?: (person: Member) => ReactNode
  onDetails: (event: Activity) => void
}) {
  const dates = [...new Set(events.map((event) => event.date))]

  return (
    <div className="activity-days">
      {dates.map((date) => (
        <section
          className="activity-day"
          key={date}
          aria-label={formatDate(date, { year: "numeric" })}
        >
          <h2>
            <time dateTime={date}>{formatDate(date)}</time>
          </h2>
          <ol className="activity-rows">
            {events
              .filter((event) => event.date === date)
              .map((event) => {
                const person = people.find(
                  (person) => person.id === event.memberId,
                )

                const project = projects.find(
                  (project) => project.id === event.projectId,
                )

                return (
                  <ActivityRow
                    key={event.id}
                    person={
                      person ?? {
                        id: event.memberId,
                        name: "Former member",
                        initials: "?",
                      }
                    }
                    name={person && renderPerson(person)}
                    action={event.action}
                    project={
                      project ? (
                        renderProject(project, event.id)
                      ) : (
                        <span>an unavailable project</span>
                      )
                    }
                    trailing={
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="activity-event-details"
                        aria-haspopup="dialog"
                        id={`event-${event.id}`}
                        aria-label={`View event: ${person?.name ?? "Former member"} ${event.action} ${project?.name ?? "unavailable project"}`}
                        onClick={() => onDetails(event)}
                      >
                        <Info aria-hidden="true" />
                      </Button>
                    }
                  />
                )
              })}
          </ol>
        </section>
      ))}
    </div>
  )
}
