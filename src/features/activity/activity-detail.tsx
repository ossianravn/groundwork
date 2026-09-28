import { RichText } from "@/kit/rich-text/rich-text"
import {
  ProjectTags,
  ProjectLinks,
} from "@/features/projects/project-resources"
import type { ReactNode } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/kit/ui/dialog"
import {
  activityFields,
  activityKinds,
  type ActivityChange,
} from "@/demo/activity"
import {
  formatDate,
  statusLabels,
  type Activity,
  type Member,
} from "@/demo/model"

function changeValue(
  change: Exclude<ActivityChange, { field: "description" | "tags" | "links" }>,
  value: string | number,
  people: Member[],
) {
  if (change.field === "ownerId")
    return people.find((p) => p.id === value)?.name ?? "Former member"

  if (change.field === "dueDate" && value)
    return formatDate(String(value), { year: "numeric" })

  if (change.field === "status")
    return (
      Object.entries(statusLabels).find(([status]) => status === value)?.[1] ??
      String(value)
    )

  return value === "" ? "None" : String(value)
}

function ChangeValue({
  change,
  side,
  people,
}: {
  change: ActivityChange
  side: "before" | "after"
  people: Member[]
}) {
  if (change.field === "description") return <RichText value={change[side]} />

  if (change.field === "tags")
    return change[side].length ? (
      <ProjectTags tags={change[side]} />
    ) : (
      <p>None</p>
    )

  if (change.field === "links")
    return change[side].length ? (
      <ProjectLinks links={change[side]} />
    ) : (
      <p>None</p>
    )

  return <p>{changeValue(change, change[side], people)}</p>
}

export function ActivityDetail({
  event,
  open,
  people,
  projectName,
  projectLink,
  onClose,
}: {
  event?: Activity
  open: boolean
  people: Member[]
  projectName: string
  projectLink: ReactNode
  onClose: () => void
}) {
  const person = people.find((person) => person.id === event?.memberId)

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="activity-detail" showCloseButton={false}>
        <DialogHeader showCloseButton>
          <DialogTitle>
            {event ? activityKinds[event.kind] : "Event unavailable"}
          </DialogTitle>
          <DialogDescription>
            {event
              ? `${person?.name ?? "Former member"} ${event.action} ${projectName}.`
              : "This event is no longer in the workspace history."}
          </DialogDescription>
        </DialogHeader>
        {event && (
          <>
            <time
              className="text-xs text-muted-foreground"
              dateTime={event.date}
            >
              {formatDate(event.date, { year: "numeric" })}
            </time>
            {event.changes?.length ? (
              <dl className="activity-changes">
                {event.changes.map((change) => (
                  <div key={change.field}>
                    <dt>{activityFields[change.field]}</dt>
                    <dd>
                      <span>Before</span>
                      <ChangeValue
                        change={change}
                        side="before"
                        people={people}
                      />
                    </dd>
                    <dd>
                      <span>After</span>
                      <ChangeValue
                        change={change}
                        side="after"
                        people={people}
                      />
                    </dd>
                  </div>
                ))}
              </dl>
            ) : event.tasksCompleted > 0 ? (
              <p>{event.tasksCompleted} tasks completed.</p>
            ) : null}
            {projectLink}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
