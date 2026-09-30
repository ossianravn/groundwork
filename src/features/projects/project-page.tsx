import { RichText } from "@/kit/rich-text/rich-text"
import { documentText } from "@/kit/rich-text/document"
import type { ReactNode } from "react"
import { ProjectStatus } from "@/components/project-status"
import type {
  Activity,
  Member,
  Project,
  ProjectComment,
  ProjectTask,
} from "@/demo/model"
import type { TaskChange } from "@/demo/project-tasks"
import { ProjectProgress } from "./project-progress"
import { ProjectMark } from "@/components/project-identity"
import { ProjectInlineField } from "./project-inline-field"
import type { ProjectInlineEditing } from "./project-inline-editing"
import { ProjectTasks } from "./project-tasks"
import { ProjectComments } from "./project-comments"
import { ProjectActivity } from "./project-activity"
import { ProjectProperties } from "./project-properties"

/**
 * A project's page: its name, status and description as the heading; the
 * work (tasks, comments, activity) in the main column; and its properties,
 * progress and files in a rail beside it. Properties and progress come first
 * in reading order and files last, so narrow screens show who owns the
 * project and when it is due, then the tasks, then attachments.
 */
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
  tasks,
  onTaskChange,
  comments,
  onPostComment,
  files,
  tagOptions,
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
  tasks: ProjectTask[]
  onTaskChange: (change: TaskChange) => (() => void) | undefined
  comments: ProjectComment[]
  onPostComment: (text: string) => boolean
  /** Attachments, shown under progress in the rail. */
  files?: ReactNode
  /** Tags offered when editing details, such as those used elsewhere. */
  tagOptions: string[]
}) {
  const owner = members.find((member) => member.id === project.ownerId)

  if (!owner) throw new Error(`Project ${project.id} has an unknown owner`)

  const events = activity
    .filter((event) => event.projectId === project.id)
    .reverse()

  return (
    <main id="main-content" className="page-content project-page" tabIndex={-1}>
      <header className="project-page-heading">
        {returnLink}
        <div className="project-page-title">
          <ProjectMark color={project.color} />
          <ProjectInlineField field="name" editing={editing} members={members}>
            {project.name}
          </ProjectInlineField>
          <ProjectStatus status={project.status} />
          {editLink}
        </div>
        {documentText(project.description) && (
          <div className="project-page-lead">
            <RichText value={project.description} />
          </div>
        )}
      </header>
      {notice && (
        <p role="status" className="project-save-notice">
          {notice}
        </p>
      )}
      <div className="project-page-grid">
        <aside className="project-rail" aria-label="Project details">
          <ProjectProperties
            project={project}
            owner={owner}
            assignableMembers={assignableMembers}
            tagOptions={tagOptions}
            editing={editing}
          />
          <ProjectProgress project={project} onComplete={onComplete} />
        </aside>
        <div className="project-main">
          <ProjectTasks
            project={project}
            tasks={tasks}
            members={assignableMembers}
            people={members}
            onChange={onTaskChange}
          />
          <ProjectComments
            comments={comments}
            people={members}
            members={assignableMembers}
            onPost={onPostComment}
          />
          <ProjectActivity events={events} members={members} />
        </div>
        {files && <div className="project-rail-files">{files}</div>}
      </div>
    </main>
  )
}
