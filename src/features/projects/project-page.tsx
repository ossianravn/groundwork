import { RichText } from "@/kit/rich-text/rich-text"
import { documentText } from "@/kit/rich-text/document"
import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/kit/ui/card"
import { MemberAvatar } from "@/kit/member-avatar"
import { ProjectStatus } from "@/components/project-status"
import {
  formatDate,
  type Activity,
  type Member,
  type Project,
} from "@/demo/model"
import { ProjectProgress } from "./project-progress"
import { actionWithinProject } from "@/demo/activity"
import { ProjectMark } from "@/components/project-identity"
import { ProjectResources } from "./project-resources"
import { ProjectInlineField } from "./project-inline-field"
import type { ProjectInlineEditing } from "./project-inline-editing"

export function ProjectPage({
  project,
  members,
  assignableMembers,
  activity,
  returnLink,
  editLink,
  notice,
  editing,
  onComplete,
}: {
  project: Project
  members: Member[]
  assignableMembers: Member[]
  activity: Activity[]
  returnLink: ReactNode
  editLink: ReactNode
  notice?: string
  editing: ProjectInlineEditing
  onComplete: (id: string) => void
}) {
  const owner = members.find((member) => member.id === project.ownerId)

  if (!owner) throw new Error(`Project ${project.id} has an unknown owner`)

  const events = activity
    .filter((event) => event.projectId === project.id)
    .reverse()

  return (
    <main id="main-content" className="page-content project-page" tabIndex={-1}>
      <div className="project-page-heading">
        {returnLink}
        <div className="project-page-title">
          <ProjectMark color={project.color} />
          <ProjectInlineField field="name" editing={editing} members={members}>
            {project.name}
          </ProjectInlineField>
          <ProjectStatus status={project.status} />
          {editLink}
        </div>
      </div>
      {notice && (
        <p role="status" className="project-save-notice">
          {notice}
        </p>
      )}
      <div className="project-page-grid">
        <Card className="project-summary">
          <CardHeader>
            <CardTitle>
              <h2>Project details</h2>
            </CardTitle>
          </CardHeader>
          <CardContent className="project-summary-content">
            {documentText(project.description) ? (
              <RichText value={project.description} />
            ) : (
              <p className="text-muted-foreground">No description added.</p>
            )}
            <dl className="project-properties">
              <div>
                <dt>Owner</dt>
                <dd>
                  <ProjectInlineField
                    field="ownerId"
                    editing={editing}
                    members={assignableMembers}
                  >
                    <MemberAvatar member={owner} size="sm" />
                    {owner.name}
                  </ProjectInlineField>
                </dd>
              </div>
              <div>
                <dt>Due date</dt>
                <dd>
                  <ProjectInlineField
                    field="dueDate"
                    editing={editing}
                    members={members}
                  >
                    <time dateTime={project.dueDate}>
                      {formatDate(project.dueDate, { year: "numeric" })}
                    </time>
                  </ProjectInlineField>
                </dd>
              </div>
            </dl>
            <ProjectResources project={project} />
          </CardContent>
        </Card>
        <ProjectProgress project={project} onComplete={onComplete} standalone />
        <Card className="project-activity">
          <CardHeader>
            <CardTitle>
              <h2>Project activity</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {events.length ? (
              <ol className="project-event-list">
                {events.map((event) => {
                  const member = members.find(
                    (item) => item.id === event.memberId,
                  )

                  if (!member)
                    throw new Error(
                      `Activity ${event.id} has an unknown member`,
                    )

                  return (
                    <li key={event.id}>
                      <MemberAvatar member={member} size="sm" />
                      <p>
                        <strong>{member.name}</strong>{" "}
                        {actionWithinProject(event.action)}
                      </p>
                      <time dateTime={event.date}>
                        {formatDate(event.date, { year: "numeric" })}
                      </time>
                    </li>
                  )
                })}
              </ol>
            ) : (
              <p className="text-muted-foreground">No activity yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
