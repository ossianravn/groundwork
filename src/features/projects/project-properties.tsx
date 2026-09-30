import { useState, type ReactNode } from "react"
import { MemberAvatar } from "@/kit/member-avatar"
import { formatDate, type Member, type Project } from "@/demo/model"
import { ProjectDetailsDialog } from "./project-details-dialog"
import type { ProjectInlineEditing } from "./project-inline-editing"
import { ProjectLinks, ProjectTags } from "./project-resources"

function Property({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

/**
 * The project's properties as label and value rows, with one Edit action
 * that changes them together in a dialog. Tags and links show only when the
 * project has them.
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

  return (
    <section
      className="project-properties-section"
      aria-labelledby="project-details-title"
    >
      <header className="project-properties-heading">
        <h2 id="project-details-title">Project details</h2>
        <ProjectDetailsDialog
          project={project}
          members={assignableMembers}
          tagOptions={tagOptions}
          onSave={(details) => {
            setAnnouncement("")

            return editing.saveDetails(details)
          }}
          onSaved={() => setAnnouncement("Details saved.")}
        />
      </header>
      <dl className="project-properties">
        <Property label="Owner">
          <MemberAvatar member={owner} size="sm" />
          {owner.name}
        </Property>
        <Property label="Due date">
          <time dateTime={project.dueDate}>
            {formatDate(project.dueDate, { year: "numeric" })}
          </time>
        </Property>
        {project.tags.length > 0 && (
          <Property label="Tags">
            <ProjectTags tags={project.tags} />
          </Property>
        )}
        {project.links.length > 0 && (
          <Property label="Links">
            <ProjectLinks links={project.links} />
          </Property>
        )}
      </dl>
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </section>
  )
}
