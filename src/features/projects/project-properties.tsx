import type { ReactNode } from "react"
import { MemberAvatar } from "@/kit/member-avatar"
import { formatDate, type Member, type Project } from "@/demo/model"
import { ProjectInlineField } from "./project-inline-field"
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
 * The project's properties as label and value rows: owner and due date edit
 * in place; tags and links show only when the project has them.
 */
export function ProjectProperties({
  project,
  owner,
  members,
  assignableMembers,
  editing,
}: {
  project: Project
  owner: Member
  members: Member[]
  assignableMembers: Member[]
  editing: ProjectInlineEditing
}) {
  return (
    <dl className="project-properties">
      <Property label="Owner">
        <ProjectInlineField
          field="ownerId"
          editing={editing}
          members={assignableMembers}
        >
          <MemberAvatar member={owner} size="sm" />
          {owner.name}
        </ProjectInlineField>
      </Property>
      <Property label="Due date">
        <ProjectInlineField field="dueDate" editing={editing} members={members}>
          <time dateTime={project.dueDate}>
            {formatDate(project.dueDate, { year: "numeric" })}
          </time>
        </ProjectInlineField>
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
  )
}
