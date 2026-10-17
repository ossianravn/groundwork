import { useState, type ReactNode } from "react"
import { MemberAvatar } from "@/kit/member-avatar"
import { Button } from "@/kit/ui/button"
import { DatePicker } from "@/kit/ui/date-picker"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"
import { ProjectProgressBar } from "@/components/project-progress-bar"
import { formatDate, type Member, type Project } from "@/demo/model"
import type { ProjectValues } from "@/demo/project-form"
import type { ProjectInlineEditing } from "./project-inline-editing"
import { ProjectLinkEditor } from "./project-link-editor"
import { ProjectTagField } from "./project-tag-field"

type Details = Partial<
  Pick<ProjectValues, "ownerId" | "dueDate" | "tags" | "links">
>

function Property({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: ReactNode
}) {
  return (
    <div>
      <dt id={id}>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

/**
 * The project's properties as label and value rows, each changed in place
 * (design-system.md, properties): owner and due date save as soon as one is
 * picked, tags as they change, links as one is added or removed. A failed
 * save keeps the saved value and offers Retry.
 */
export function ProjectProperties({
  project,
  owner,
  assignableMembers,
  tagOptions,
  editing,
}: {
  project: Project
  owner: Member
  assignableMembers: Member[]
  tagOptions: string[]
  editing: ProjectInlineEditing
}) {
  const [announcement, setAnnouncement] = useState("")

  // A change that failed to save, kept for Retry.
  const [failed, setFailed] = useState<{
    changes: Details
    outcome: string
  } | null>(null)

  const percent = project.tasks
    ? Math.round((project.completedTasks / project.tasks) * 100)
    : 0

  const items = assignableMembers.map((member) => ({
    value: member.id,
    label: member.name,
  }))

  function save(changes: Details, outcome: string) {
    const result = editing.saveDetails(changes)

    setAnnouncement("")

    if (result.kind === "saved") {
      setFailed(null)
      setAnnouncement(outcome)
    } else setFailed({ changes, outcome })

    return result.kind === "saved"
  }

  return (
    <section
      className="project-properties-section"
      aria-labelledby="project-details-title"
    >
      <h2 id="project-details-title" tabIndex={-1}>
        Project details
      </h2>
      <dl className="project-properties">
        <Property id="project-progress-label" label="Progress">
          {project.tasks ? (
            <span className="project-progress-row">
              <ProjectProgressBar
                color={project.color}
                value={percent}
                label="Completed tasks"
              />
              <span>
                {project.completedTasks} of {project.tasks} · {percent}%
              </span>
            </span>
          ) : (
            <span className="text-muted-foreground">No tasks yet</span>
          )}
        </Property>
        <Property id="project-owner-label" label="Owner">
          <Select
            items={items}
            value={project.ownerId}
            onValueChange={(id) => {
              const next = assignableMembers.find((member) => member.id === id)

              if (next && next.id !== project.ownerId)
                save({ ownerId: next.id }, `Owner changed to ${next.name}.`)
            }}
          >
            <SelectTrigger
              className="project-property-control"
              aria-labelledby="project-owner-label project-owner-value"
            >
              <MemberAvatar member={owner} size="sm" />
              <SelectValue id="project-owner-value" />
            </SelectTrigger>
            <SelectContent alignItemWithTrigger={false}>
              <SelectGroup>
                {items.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Property>
        <Property id="project-due-label" label="Due date">
          <DatePicker
            id="project-due-date"
            labelledBy="project-due-label"
            className="project-property-control"
            value={project.dueDate}
            onValueChange={(dueDate) => {
              if (dueDate !== project.dueDate)
                save(
                  { dueDate },
                  `Due date changed to ${formatDate(dueDate, { year: "numeric" })}.`,
                )
            }}
          />
        </Property>
        <Property id="project-tags-label" label="Tags">
          <ProjectTagField
            id="project-tags"
            hideLabel
            tags={project.tags}
            options={tagOptions}
            onChange={(tags) => save({ tags }, "Tags saved.")}
          />
        </Property>
        <Property id="project-links-label" label="Links">
          <ProjectLinkEditor
            links={project.links}
            onChange={(links) =>
              save(
                { links },
                links.length > project.links.length
                  ? "Link added."
                  : "Link removed.",
              )
            }
          />
        </Property>
      </dl>
      {failed && (
        <p role="alert" className="project-property-failure">
          Your change wasn't saved; the saved value is still shown.{" "}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Retry goes away once it works; focus returns to the section.
              if (save(failed.changes, failed.outcome))
                document.getElementById("project-details-title")?.focus()
            }}
          >
            Retry
          </Button>
        </p>
      )}
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </section>
  )
}
