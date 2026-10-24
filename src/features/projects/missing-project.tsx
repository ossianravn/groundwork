import { Button } from "@/kit/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/kit/ui/dialog"

/** What a quick view link shows when its project isn't in the demo. */
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
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent showCloseButton={false} finalFocus={returnFocus}>
        <DialogHeader showCloseButton>
          <DialogTitle>Project unavailable</DialogTitle>
          <DialogDescription>
            This project is not in the current demo. Projects created during a
            session are removed when the demo reloads or resets.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onReturn}>
            Return to projects
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
