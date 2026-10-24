import { textDocument } from "@/kit/rich-text/document"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/kit/ui/dialog"
import { ProjectForm } from "@/features/projects/project-form"
import { ProjectMark } from "@/components/project-identity"
import {
  projectValuesChanged,
  type ProjectSaveResult,
  type ProjectSaveScenario,
  type ProjectValues,
} from "@/demo/project-form"
import { nextProjectColor } from "@/demo/project-colors"
import { createProjectDraft, refreshProjectDraft } from "@/demo/project-draft"
import type { useWorkspace } from "@/demo/use-workspace"
import type { useProjectDrafts } from "@/demo/use-project-drafts"

const key = "new"

/**
 * New project, as a dialog over the page it was asked for from (`?create`).
 * Closing keeps the draft for next time; Cancel discards it. A created
 * project opens in its quick view, which says it was created.
 */
export function NewProjectHost({
  demo,
  drafts,
  scenario,
  onClose,
  onCreated,
  returnFocus,
}: {
  demo: ReturnType<typeof useWorkspace>
  drafts: ReturnType<typeof useProjectDrafts>
  scenario: ProjectSaveScenario
  onClose: () => void
  onCreated: (projectId: string) => void
  returnFocus: () => HTMLElement | null
}) {
  const initial: ProjectValues = {
    name: "",
    description: textDocument(""),
    ownerId: demo.workspace.currentUserId,
    color: nextProjectColor(demo.projects.length),
    dueDate: "",
    tags: [],
    links: [],
  }

  const draft = refreshProjectDraft(
    drafts.entries[key] ?? createProjectDraft(initial, scenario),
    initial,
  )

  function save(): ProjectSaveResult {
    const result = demo.saveProject(
      { kind: "create" },
      draft.values,
      draft.scenario,
    )

    if (result.kind === "saved") {
      drafts.discard(key)
      onCreated(result.projectId)
    } else if (result.kind === "invalid") {
      drafts.update(key, { ...draft, errors: result.errors })
    } else {
      drafts.update(key, {
        ...draft,
        failure: result.message,
        scenario: "normal",
      })
    }

    return result
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="new-project-dialog"
        showCloseButton={false}
        initialFocus={() => document.getElementById("edit-project-name")}
        finalFocus={returnFocus}
      >
        <DialogHeader showCloseButton>
          <DialogTitle className="new-project-title">
            <ProjectMark color={draft.values.color} />
            New project
          </DialogTitle>
          <DialogDescription>
            Your draft is kept until you create or cancel it.
          </DialogDescription>
        </DialogHeader>
        <div className="new-project-body">
          <ProjectForm
            values={draft.values}
            tagOptions={demo.projects.flatMap((item) => item.tags)}
            members={demo.workspace.members}
            errors={draft.errors}
            failure={draft.failure}
            creating
            dirty={projectValuesChanged(draft.values, initial)}
            onChange={(field, value) =>
              drafts.update(key, {
                ...draft,
                values: { ...draft.values, [field]: value },
                errors: { ...draft.errors, [field]: undefined },
              })
            }
            onSave={save}
            onCancel={() => {
              drafts.discard(key)
              onClose()
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
