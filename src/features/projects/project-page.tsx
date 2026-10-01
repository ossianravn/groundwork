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
import { ProjectHeaderProgress } from "./project-header-progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/kit/ui/tabs"
import { ProjectMark } from "@/components/project-identity"
import { ProjectInlineField } from "./project-inline-field"
import type { ProjectInlineEditing } from "./project-inline-editing"
import { ProjectTasks } from "./project-tasks"
import { ProjectComments } from "./project-comments"
import { ProjectActivity } from "./project-activity"
import { BurnUpChart } from "@/features/analytics/burn-up-chart"
import { ProjectProperties } from "./project-properties"

export type ProjectTab = "tasks" | "comments" | "activity" | "agent"

const isProjectTab = (value: unknown): value is ProjectTab =>
  value === "tasks" ||
  value === "comments" ||
  value === "activity" ||
  value === "agent"

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
  editLink,
  notice,
  editing,
  onComplete,
  tasks,
  onTaskChange,
  comments,
  onPostComment,
  files,
  agent,
  tagOptions,
  tab,
  onTabChange,
  referenceDate,
}: {
  project: Project
  members: Member[]
  assignableMembers: Member[]
  activity: Activity[]
  editLink: ReactNode
  notice?: string
  editing: ProjectInlineEditing
  onComplete: (id: string) => void
  tasks: ProjectTask[]
  onTaskChange: (change: TaskChange) => (() => void) | undefined
  comments: ProjectComment[]
  onPostComment: (text: string) => boolean
  /** Attachments, shown under the details in the rail. */
  files?: ReactNode
  /** The agent's runs on the project; alert when one needs the person. */
  agent: { panel: ReactNode; runs: number; alert: boolean }
  /** Tags offered when editing details, such as those used elsewhere. */
  tagOptions: string[]
  /** The open section; the host keeps it in the URL. */
  tab: ProjectTab
  onTabChange: (tab: ProjectTab) => void
  /** The snapshot date the burn-up projects from. */
  referenceDate: string
}) {
  const owner = members.find((member) => member.id === project.ownerId)

  if (!owner) throw new Error(`Project ${project.id} has an unknown owner`)

  const events = activity
    .filter((event) => event.projectId === project.id)
    .reverse()

  return (
    <main id="main-content" className="page-content project-page" tabIndex={-1}>
      <header className="project-page-heading">
        <div className="project-page-title">
          <ProjectMark color={project.color} />
          <ProjectInlineField field="name" editing={editing} members={members}>
            {project.name}
          </ProjectInlineField>
          <ProjectStatus status={project.status} />
          <div className="project-header-side">
            <ProjectHeaderProgress project={project} onComplete={onComplete} />
            {editLink}
          </div>
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
        <aside className="project-rail" aria-labelledby="project-details-title">
          <ProjectProperties
            project={project}
            owner={owner}
            assignableMembers={assignableMembers}
            tagOptions={tagOptions}
            editing={editing}
          />
        </aside>
        <Tabs
          className="project-main"
          value={tab}
          onValueChange={(value) => {
            if (isProjectTab(value)) onTabChange(value)
          }}
        >
          <TabsList variant="line" aria-label="Project sections">
            <TabsTrigger value="tasks">
              Tasks{" "}
              <span className="project-tab-count">
                {tasks.filter((task) => !task.done).length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="comments">
              Comments{" "}
              <span className="project-tab-count">{comments.length}</span>
            </TabsTrigger>
            <TabsTrigger value="activity">
              Activity{" "}
              <span className="project-tab-count">{events.length}</span>
            </TabsTrigger>
            <TabsTrigger value="agent">
              Agent{" "}
              {agent.alert ? (
                <span className="project-tab-alert">
                  <span className="sr-only">needs you</span>
                </span>
              ) : (
                agent.runs > 0 && (
                  <span className="project-tab-count">{agent.runs}</span>
                )
              )}
            </TabsTrigger>
          </TabsList>
          {/* Panels stay mounted, so a comment draft or an opened task
              survives a look at another section. */}
          <TabsContent value="tasks" keepMounted>
            <ProjectTasks
              project={project}
              tasks={tasks}
              members={assignableMembers}
              people={members}
              onChange={onTaskChange}
            />
          </TabsContent>
          <TabsContent value="comments" keepMounted>
            <ProjectComments
              comments={comments}
              people={members}
              members={assignableMembers}
              onPost={onPostComment}
            />
          </TabsContent>
          <TabsContent value="activity" keepMounted>
            <BurnUpChart
              project={project}
              tasks={tasks}
              referenceDate={referenceDate}
              className="project-burn-up"
            />
            <ProjectActivity events={events} members={members} />
          </TabsContent>
          <TabsContent value="agent" keepMounted>
            {agent.panel}
          </TabsContent>
        </Tabs>
        {files && <div className="project-rail-files">{files}</div>}
      </div>
    </main>
  )
}
