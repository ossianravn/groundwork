import { useRef, useState, type FormEvent } from "react"
import { Bookmark, Check, ChevronDown, Link2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/kit/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/kit/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/kit/ui/dropdown-menu"
import { Field, FieldError, FieldLabel } from "@/kit/ui/field"
import { Input } from "@/kit/ui/input"

interface ViewSummary {
  id: string
  name: string
  builtIn: boolean
}

// Named filter, sort and layout combinations (TABL-15). The button names
// the view that matches what is shown; its link reproduces the view.
export function SavedViewsMenu({
  views,
  activeId,
  onApply,
  onSave,
  onDelete,
  onCopyLink,
}: {
  views: ViewSummary[]
  /** The view whose settings match the current results, if any. */
  activeId: string | null
  onApply: (id: string) => void
  /** Saves the current results; returns an error message or "". */
  onSave: (name: string) => string
  onDelete: (id: string) => void
  onCopyLink: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const trigger = useRef<HTMLButtonElement>(null)
  const active = views.find((view) => view.id === activeId)

  function save(event: FormEvent) {
    event.preventDefault()
    const message = onSave(name)

    setError(message)

    if (message) return

    setSaving(false)
    setName("")
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          ref={trigger}
          render={<Button variant="outline" className="saved-views-trigger" />}
          aria-label={`Saved views: ${active?.name ?? "none selected"}`}
        >
          <Bookmark aria-hidden="true" data-icon="inline-start" />
          <span className="saved-views-label">{active?.name ?? "Views"}</span>
          <ChevronDown aria-hidden="true" data-icon="inline-end" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="saved-views-menu">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Saved views</DropdownMenuLabel>
            {views.map((view) => (
              <DropdownMenuItem
                key={view.id}
                aria-current={view.id === activeId || undefined}
                onClick={() => onApply(view.id)}
              >
                <Check
                  aria-hidden="true"
                  className={view.id === activeId ? undefined : "invisible"}
                />
                {view.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              disabled={!!active}
              onClick={() => setSaving(true)}
            >
              <Plus aria-hidden="true" />
              {active ? `Saved as ${active.name}` : "Save current view…"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCopyLink}>
              <Link2 aria-hidden="true" />
              Copy link
            </DropdownMenuItem>
            {active && !active.builtIn && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(active.id)}
              >
                <Trash2 aria-hidden="true" />
                Delete {active.name}
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog
        open={saving}
        onOpenChange={(open) => {
          setSaving(open)
          setError("")
        }}
      >
        <DialogContent finalFocus={trigger}>
          <form onSubmit={save} noValidate className="saved-view-form">
            <DialogHeader>
              <DialogTitle>Save view</DialogTitle>
            </DialogHeader>
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="saved-view-name">Name</FieldLabel>
              <Input
                id="saved-view-name"
                value={name}
                autoComplete="off"
                onChange={(event) => {
                  setName(event.target.value)
                  setError("")
                }}
                aria-invalid={!!error}
                aria-describedby={error ? "saved-view-error" : undefined}
              />
              {error && <FieldError id="saved-view-error">{error}</FieldError>}
            </Field>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSaving(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save view</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
