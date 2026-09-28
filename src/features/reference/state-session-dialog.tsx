import { Button } from "@/kit/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/kit/ui/dialog"

export function StateSessionDialog({
  open,
  onOpenChange,
  onResume,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onResume: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        finalFocus={() => document.getElementById("edit-project-name")}
      >
        <DialogHeader showCloseButton>
          <DialogTitle>Resume your session</DialogTitle>
          <DialogDescription>
            This example uses Ava Morgan’s local demo account. No password is
            needed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button onClick={onResume}>Continue as Ava Morgan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
