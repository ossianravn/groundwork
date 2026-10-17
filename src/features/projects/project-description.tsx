import { useState } from "react"
import { Pencil } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { RichText } from "@/kit/rich-text/rich-text"
import { RichTextEditor } from "@/kit/rich-text/rich-text-editor"
import {
  documentText,
  textDocument,
  type RichTextDocument,
} from "@/kit/rich-text/document"

const focus = (id: string) =>
  requestAnimationFrame(() => document.getElementById(id)?.focus())

/**
 * The project's description as the page's lead, edited in place: the
 * rich-text editor with Cancel and Save (or Escape), then back to reading
 * with focus on the edit action. Saving returns false when it failed, and
 * the draft stays open.
 */
export function ProjectDescription({
  description,
  onSave,
}: {
  description: RichTextDocument
  onSave: (description: RichTextDocument) => boolean
}) {
  const [draft, setDraft] = useState<RichTextDocument | null>(null)
  const [failed, setFailed] = useState(false)
  const empty = !documentText(description)

  function close() {
    setDraft(null)
    setFailed(false)
    focus("project-description-edit")
  }

  if (draft)
    return (
      <div
        className="project-description"
        data-editing=""
        onKeyDown={(event) => {
          // Escape in the text closes the editor; the link popover keeps its own.
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
        <p id="project-description-label" className="sr-only">
          Project description
        </p>
        <RichTextEditor
          id="project-description-editor"
          labelledBy="project-description-label"
          value={draft}
          onChange={setDraft}
        />
        {failed && (
          <p role="alert" className="project-property-failure">
            The description wasn't saved. Try again.
          </p>
        )}
        <div className="project-inline-actions">
          <Button size="sm" variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (onSave(draft)) close()
              else setFailed(true)
            }}
          >
            {failed ? "Retry save" : "Save"}
          </Button>
        </div>
      </div>
    )

  return (
    <div className="project-description">
      {empty ? (
        <p className="text-muted-foreground">
          No description yet. Say what the project delivers, for whoever opens
          it next.
        </p>
      ) : (
        <RichText value={description} />
      )}
      <Button
        id="project-description-edit"
        size="sm"
        variant="ghost"
        className="project-description-edit"
        onClick={() => {
          setDraft(empty ? textDocument("") : description)
          focus("project-description-editor")
        }}
      >
        <Pencil aria-hidden="true" data-icon="inline-start" />
        {empty ? "Add a description" : "Edit description"}
      </Button>
    </div>
  )
}
