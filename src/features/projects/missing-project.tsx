import { Button } from "@/kit/ui/button"
import { Sheet, SheetContent } from "@/kit/ui/sheet"
import { PanelHeader } from "@/kit/panel-header"

export function MissingProject({
  onClose,
  onReturn,
  returnFocus,
}: {
  onClose: () => void
  onReturn: () => void
  returnFocus: () => HTMLElement | null
}) {
  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <SheetContent
        className="panel-sheet"
        showCloseButton={false}
        finalFocus={returnFocus}
      >
        <PanelHeader
          title="Project unavailable"
          description="This project is not in the current demo. Projects created during a session are removed when the demo reloads or resets."
        />
        <div className="project-sheet-body">
          <Button variant="outline" onClick={onReturn}>
            Return to projects
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
