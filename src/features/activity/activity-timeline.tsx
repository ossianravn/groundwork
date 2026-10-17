import type { ReactNode } from "react"
import { ActivityRow } from "@/components/activity-row"
import { activityWeeks } from "@/demo/activity"
import {
  formatDate,
  type Activity,
  type Member,
  type Project,
} from "@/demo/model"

/**
 * The Activity page's feed: week headings over the shared activity rows,
 * each dated at its end. A date opens the event's details.
 */
export function ActivityTimeline({
  events,
  people,
  projects,
  reference,
  renderProject,
  renderPerson = (person) => person.name,
  onDetails,
}: {
  events: Activity[]
  people: Member[]
  projects: Project[]
  /** The snapshot date that "This week" counts from. */
  reference: string
  renderProject: (project: Project, eventId: string) => ReactNode
  /** A known person's name, such as a link with a hover card. */
  renderPerson?: (person: Member) => ReactNode
  onDetails: (event: Activity) => void
}) {
  return (
    <div className="activity-weeks">
      {activityWeeks(events, reference).map((week) => (
        <section
          className="activity-week"
          key={week.start}
          aria-labelledby={`activity-week-${week.start}`}
        >
          <h2 id={`activity-week-${week.start}`}>{week.label}</h2>
          <ol className="activity-rows">
            {week.events.map((event) => {
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
                  date={event.date}
                  details={{
                    id: `event-${event.id}`,
                    label: `${formatDate(event.date)}: details of ${person?.name ?? "Former member"} ${event.action} ${project?.name ?? "an unavailable project"}`,
                    onOpen: () => onDetails(event),
                  }}
                />
              )
            })}
          </ol>
        </section>
      ))}
    </div>
  )
}
