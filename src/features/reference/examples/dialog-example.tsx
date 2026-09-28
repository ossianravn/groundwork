import { useState } from "react"
import { Button } from "@/kit/ui/button"
import { Input } from "@/kit/ui/input"
import { Field, FieldLabel } from "@/kit/ui/field"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/kit/ui/dialog"

export function DialogExample() {
  const [name, setName] = useState("Brand refresh")
  const [draft, setDraft] = useState(name)
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-wrap items-center gap-4">
      <strong>{name}</strong>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (value) setDraft(name)
          setOpen(value)
        }}
      >
        <DialogTrigger render={<Button variant="outline" />}>
          Rename
        </DialogTrigger>
        <DialogContent showCloseButton={false}>
          <DialogHeader showCloseButton>
            <DialogTitle>Rename project</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault()

              if (!draft.trim()) return
              setName(draft.trim())
              setOpen(false)
            }}
          >
            <Field>
              <FieldLabel htmlFor="preview-project-name">
                Project name
              </FieldLabel>
              <Input
                id="preview-project-name"
                required
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
            </Field>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={!draft.trim()}>
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
