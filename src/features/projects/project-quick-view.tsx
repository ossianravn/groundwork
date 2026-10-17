import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react"
import { ChevronDown, ChevronUp, X } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Dialog, DialogClose, DialogContent } from "@/kit/ui/dialog"
import { ProjectMark } from "@/components/project-identity"
import { ProjectStatus } from "@/components/project-status"
import type {
  Activity,
  Member,
  Project,
  ProjectComment,
  ProjectTask,
} from "@/demo/model"
import type { TaskChange } from "@/demo/project-tasks"
import { ProjectActivity } from "./project-activity"
import { ProjectComments } from "./project-comments"
import { ProjectCompletion } from "./project-completion"
import { ProjectDescription } from "./project-description"
import { ProjectInlineField } from "./project-inline-field"
import type { ProjectInlineEditing } from "./project-inline-editing"
import { ProjectProperties } from "./project-properties"
import { ProjectTasks } from "./project-tasks"
import { quickViewKeyOwners, quickViewStep } from "./quick-view-step"

/**
 * A project opened in place over the list it came from (design-system.md,
 * one way to open a project): its name, status and properties, editable
 * where they are; the description and progress; tasks, comments and
 * activity; and files. Open full page leads to the project page for deeper
 * work, and J and K step to the previous and next project in the list.
 */
export function ProjectQuickView({
  project,
  members,
  assignableMembers,
  activity,
  editing,
  onComplete,
  onReopen,
  tasks,
  onTaskChange,
  comments,
  onPostComment,
  commentAuthor,
  files,
  tagOptions,
  notice,
  fullPage,
  position,
  onClose,
  returnFocus,
}: {
  project: Project
  members: Member[]
  assignableMembers: Member[]
  activity: Activity[]
  editing: ProjectInlineEditing
  onComplete: (id: string) => void
  onReopen: (id: string) => void
  tasks: ProjectTask[]
  onTaskChange: (change: TaskChange) => (() => void) | undefined
  comments: ProjectComment[]
  onPostComment: (text: string) => boolean
  /** The person commenting, beside the composer. */
  commentAuthor?: Member
  files: ReactNode
  tagOptions: string[]
  /** The outcome that opened it, such as Project created. */
  notice?: string
  /** A link to the project's page. */
  fullPage: ReactNode
  /** Where the project sits in the list behind, for J and K. */
  position?: { index: number; count: number; onStep: (step: -1 | 1) => void }
  onClose: () => void
  returnFocus: () => HTMLElement | null
}) {
  const owner = members.find((member) => member.id === project.ownerId)

  if (!owner) throw new Error(`Project ${project.id} has an unknown owner`)

  const events = activity
    .filter((event) => event.projectId === project.id)
    .reverse()

  // After J or K the next record replaces this one; reading starts at its
  // name. The host shows the next project after it navigates.
  const stepped = useRef(false)

  useEffect(() => {
    if (!stepped.current) return
    stepped.current = false
    document.getElementById("project-quick-view-title")?.focus()
  }, [project.id])

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const owned =
      event.target instanceof Element &&
      !!event.target.closest(quickViewKeyOwners)

    const step = position && quickViewStep(event, position, owned)

    if (!step) return
    event.preventDefault()
    stepped.current = true
    position.onStep(step)
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        className="project-quick-view"
        showCloseButton={false}
        aria-labelledby="project-quick-view-title"
        // The record is long: focus starts on its name, not its first control.
        initialFocus={() => document.getElementById("project-quick-view-title")}
        finalFocus={returnFocus}
        onKeyDown={onKeyDown}
      >
        <header className="quick-view-header">
          <div className="quick-view-title">
            <ProjectMark color={project.color} />
            <ProjectInlineField
              key={project.id}
              field="name"
              editing={editing}
              members={members}
              headingId="project-quick-view-title"
            >
              {project.name}
            </ProjectInlineField>
            <ProjectStatus status={project.status} />
          </div>
          <div className="quick-view-tools">
            {position && position.count > 1 && (
              <div className="quick-view-steps">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Previous project"
                  aria-keyshortcuts="K"
                  title="Previous project (K)"
                  disabled={position.index === 0}
                  focusableWhenDisabled
                  onClick={() => position.onStep(-1)}
                >
                  <ChevronUp aria-hidden="true" />
                </Button>
                <span>
                  {position.index + 1} of {position.count}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Next project"
                  aria-keyshortcuts="J"
                  title="Next project (J)"
                  disabled={position.index === position.count - 1}
                  focusableWhenDisabled
                  onClick={() => position.onStep(1)}
                >
                  <ChevronDown aria-hidden="true" />
                </Button>
              </div>
            )}
            <ProjectCompletion
              project={project}
              onComplete={onComplete}
              onReopen={onReopen}
            />
            {fullPage}
            <DialogClose
              className="quick-view-close"
              render={<Button variant="ghost" size="icon-sm" />}
            >
              <X aria-hidden="true" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </header>
        <div className="quick-view-body" key={project.id}>
          <div className="quick-view-properties">
            <ProjectProperties
              project={project}
              owner={owner}
              assignableMembers={assignableMembers}
              tagOptions={tagOptions}
              editing={editing}
            />
          </div>
          <div className="quick-view-main">
            {notice && (
              <p role="status" className="quick-view-notice">
                {notice}
              </p>
            )}
            <div className="quick-view-description">
              <ProjectDescription
                description={project.description}
                onSave={(description) =>
                  editing.saveDetails({ description }).kind === "saved"
                }
              />
            </div>
            <section aria-labelledby="quick-view-tasks">
              <h2 id="quick-view-tasks">Tasks</h2>
              <ProjectTasks
                project={project}
                tasks={tasks}
                members={assignableMembers}
                people={members}
                onChange={onTaskChange}
              />
            </section>
            <section aria-labelledby="quick-view-comments">
              <h2 id="quick-view-comments">Comments</h2>
              <ProjectComments
                comments={comments}
                people={members}
                members={assignableMembers}
                onPost={onPostComment}
                author={commentAuthor}
              />
            </section>
            <section aria-labelledby="quick-view-activity">
              <h2 id="quick-view-activity">Activity</h2>
              <ProjectActivity events={events} members={members} />
            </section>
          </div>
          <div className="quick-view-files">{files}</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
