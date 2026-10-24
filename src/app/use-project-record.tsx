import type { Project } from "@/demo/model"
import { ProjectFiles } from "@/features/projects/project-files"
import { projectRecord } from "@/features/projects/project-record"
import { useDemoState } from "./demo-state"
import { useProjectUndo } from "./use-project-undo"
import { useDemoWorkspace } from "./workspace-context"

/**
 * A project's record bound to the demo: its files, and completion with the
 * shared Undo toast. The project page and the quick view render the same
 * record.
 */
export function useProjectRecord(project: Project, scenario?: string) {
  const { demo, drafts } = useDemoWorkspace()
  const { files } = useDemoState()
  const undo = useProjectUndo()

  return {
    ...projectRecord(
      demo,
      drafts,
      project,
      scenario === "save-failure" ? "save-failure" : "normal",
    ),
    onComplete: undo.completeProject,
    onReopen: undo.reopenProject,
    files: (
      <ProjectFiles
        files={files.files.filter((file) => file.projectId === project.id)}
        people={demo.workspace.people}
        failFirstUpload={scenario === "upload-failure"}
        onRemove={files.remove}
        onUploaded={(file) =>
          files.add({
            id: crypto.randomUUID(),
            projectId: project.id,
            name: file.name,
            type: file.type || "application/octet-stream",
            size: file.size,
            url: URL.createObjectURL(file),
            uploadedBy: demo.workspace.currentUserId,
            date: demo.workspace.referenceDate,
          })
        }
      />
    ),
  }
}
