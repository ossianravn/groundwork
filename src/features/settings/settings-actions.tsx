import { Check } from "lucide-react"
import { Button } from "@/kit/ui/button"

export function SettingsActions({
  dirty,
  saved,
  onCancel,
}: {
  dirty: boolean
  saved: boolean
  onCancel: () => void
}) {
  return (
    <div className="settings-actions">
      <Button type="submit" disabled={!dirty}>
        {saved && !dirty ? (
          <>
            <Check aria-hidden="true" />
            Saved
          </>
        ) : (
          "Save changes"
        )}
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={onCancel}
        disabled={!dirty}
      >
        Cancel
      </Button>
      <span role="status" className="sr-only">
        {saved && !dirty ? "Changes saved for this demo session." : ""}
      </span>
    </div>
  )
}
