import { useState } from "react"
import { Pencil } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { RichText } from "@/kit/rich-text/rich-text"
import { RichTextEditor } from "@/kit/rich-text/rich-text-editor"
import { textDocument, type RichTextDocument } from "@/kit/rich-text/document"
import type { ProjectTask } from "@/demo/model"

const focus = (id: string) =>
  requestAnimationFrame(() => document.getElementById(id)?.focus())

/**
 * An opened task's description: read it, then edit it in place with the
 * rich-text editor. Save and Cancel (or Escape) return to reading, with
 * focus back on the edit action.
 */
export function ProjectTaskDescription({
  id,
  task,
  readOnly,
  onSave,
}: {
  /** The panel's id, which the task's title controls. */
  id: string
  task: ProjectTask
  readOnly: boolean
  onSave: (description: RichTextDocument) => void
}) {
  const [draft, setDraft] = useState<RichTextDocument | null>(null)
  const editId = `${id}-edit`
  const editorId = `${id}-editor`
  const labelId = `${id}-label`

  function close() {
    setDraft(null)
    focus(editId)
  }

  if (draft)
    return (
      <div
        id={id}
        className="task-description"
        onKeyDown={(event) => {
          // The editor marks Escape handled (it blurs), so the text area is
          // matched directly; Escape in the link popover stays with it.
          if (
            event.key === "Escape" &&
            event.target instanceof Element &&
            event.target.closest(".rich-text-input")
          ) {
            event.preventDefault()
            close()
          }
        }}
      >
        <p id={labelId} className="sr-only">
          Description of {task.title}
        </p>
        <RichTextEditor
          id={editorId}
          labelledBy={labelId}
          value={draft}
          onChange={setDraft}
        />
        <div className="task-description-actions">
          <Button
            size="sm"
            onClick={() => {
              onSave(draft)
              close()
            }}
          >
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={close}>
            Cancel
          </Button>
        </div>
      </div>
    )

  return (
    <div id={id} className="task-description">
      {task.description ? (
        <RichText value={task.description} />
      ) : (
        <p className="text-muted-foreground">No description.</p>
      )}
      {!readOnly && (
        <Button
          id={editId}
          size="sm"
          variant="ghost"
          className="task-description-edit"
          onClick={() => {
            setDraft(task.description ?? textDocument(""))
            focus(editorId)
          }}
        >
          <Pencil aria-hidden="true" data-icon="inline-start" />
          {task.description ? "Edit description" : "Add a description"}
        </Button>
      )}
    </div>
  )
}
