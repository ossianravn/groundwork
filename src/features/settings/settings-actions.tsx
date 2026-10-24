import { useRef } from "react"
import { Button } from "@/kit/ui/button"

/**
 * A settings form's footer: what state the form is in at the start, then
 * Cancel and Save at the end (design-system.md, form footers). Save stays
 * available, and the form validates when it is submitted; Cancel appears
 * once there is something to discard, and focus moves to Save when it goes.
 */
export function SettingsActions({
  dirty,
  saved,
  onCancel,
}: {
  dirty: boolean
  saved: boolean
  onCancel: () => void
}) {
  const save = useRef<HTMLButtonElement>(null)

  return (
    <div className="settings-actions">
      <p role="status" className="settings-actions-status">
        {dirty
          ? "Unsaved changes"
          : saved
            ? "Saved for this demo session."
            : ""}
      </p>
      {dirty && (
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onCancel()
            save.current?.focus()
          }}
        >
          Cancel
        </Button>
      )}
      <Button ref={save} type="submit">
        Save changes
      </Button>
    </div>
  )
}
