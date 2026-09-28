import { useRef, useState } from "react"
import { Field, FieldLabel } from "@/kit/ui/field"
import { Button } from "@/kit/ui/button"
import { RichTextEditor } from "@/kit/rich-text/rich-text-editor"
import { RichText } from "@/kit/rich-text/rich-text"
import { textDocument } from "@/kit/rich-text/document"

const initial = textDocument(
  "Refresh the visual identity for Studio North.\nReview the guidelines with the design team before launch.",
)

export function RichTextExample() {
  const [draft, setDraft] = useState(initial)
  const [saved, setSaved] = useState(initial)
  const [editing, setEditing] = useState(true)
  const root = useRef<HTMLDivElement>(null)

  function changeMode(edit: boolean) {
    setEditing(edit)
    requestAnimationFrame(() =>
      root.current
        ?.querySelector<HTMLElement>(
          edit ? '[contenteditable="true"]' : "button",
        )
        ?.focus(),
    )
  }

  return (
    <div ref={root} className="rich-text-example">
      {editing ? (
        <>
          <Field>
            <FieldLabel id="example-brief-label" htmlFor="example-brief">
              Project description
            </FieldLabel>
            <RichTextEditor
              id="example-brief"
              labelledBy="example-brief-label"
              value={draft}
              onChange={setDraft}
            />
          </Field>
          <div className="editor-link-actions">
            <Button
              variant="outline"
              onClick={() => {
                setDraft(saved)
                changeMode(false)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setSaved(draft)
                changeMode(false)
              }}
            >
              Save description
            </Button>
          </div>
        </>
      ) : (
        <>
          <RichText value={saved} />
          <div>
            <Button variant="outline" onClick={() => changeMode(true)}>
              Edit description
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
