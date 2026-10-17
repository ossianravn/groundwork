import type { Project } from "@/demo/model"
import type { ProjectDraftStore } from "@/demo/project-draft"
import type { ProjectSaveScenario } from "@/demo/project-form"
import type { TaskChange } from "@/demo/project-tasks"
import type { useWorkspace } from "@/demo/use-workspace"
import { projectInlineEditing } from "./project-inline-editing"

/**
 * What a project's record shows and changes in a workspace: its people,
 * tasks, comments, activity and inline editing. The project page and the
 * quick view render it; hosts add files and their own Undo.
 */
export function projectRecord(
  workspace: ReturnType<typeof useWorkspace>,
  drafts: ProjectDraftStore,
  project: Project,
  scenario: ProjectSaveScenario = "normal",
) {
  return {
    project,
    editing: projectInlineEditing(
      project,
      drafts,
      (target, values, mode) =>
        workspace.saveProject(target, values, mode, false),
      scenario,
    ),
    members: workspace.workspace.people,
    assignableMembers: workspace.workspace.members,
    activity: workspace.activity,
    referenceDate: workspace.workspace.referenceDate,
    tagOptions: [
      ...new Set(workspace.projects.flatMap((item) => item.tags)),
    ].sort(),
    onComplete: (id: string) => {
      workspace.completeProject(id)
    },
    onReopen: (id: string) => {
      workspace.bulkChangeProjects([id], {
        kind: "move",
        status: "in-progress",
      })
    },
    tasks: workspace.tasks.filter((task) => task.projectId === project.id),
    comments: workspace.comments.filter(
      (comment) => comment.projectId === project.id,
    ),
    onPostComment: (text: string) => workspace.postComment(project.id, text),
    onTaskChange: (change: TaskChange) => {
      const reversal = workspace.changeTask(change)

      return reversal ? () => workspace.undoProjectChange(reversal) : undefined
    },
  }
}
