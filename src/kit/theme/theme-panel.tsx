import { useId } from "react"
import { Button } from "@/kit/ui/button"
import { Sheet, SheetContent, SheetFooter } from "@/kit/ui/sheet"
import { PanelHeader } from "@/kit/panel-header"
import { AppearanceSettings } from "./appearance-settings"
import type { ThemeSettings } from "./preferences"

interface ThemePanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  theme: ThemeSettings
  onChange: (theme: ThemeSettings) => void
  saved: boolean
  feedback: string
  onRestore: () => void
}

export function ThemePanel({
  open,
  onOpenChange,
  theme,
  onChange,
  saved,
  feedback,
  onRestore,
}: ThemePanelProps) {
  const descriptionId = useId()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className="panel-sheet appearance-sheet"
        aria-describedby={descriptionId}
      >
        <PanelHeader title="Appearance" />
        <div className="panel-scroll panel-body">
          <AppearanceSettings theme={theme} onChange={onChange} />
        </div>
        <SheetFooter className="panel-footer appearance-footer">
          <p id={descriptionId} role="status" className="panel-feedback">
            {feedback ||
              (saved
                ? "Preferences save on this device."
                : "Changes apply to this session only.")}
          </p>
          <Button variant="ghost" onClick={onRestore}>
            Restore defaults
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
