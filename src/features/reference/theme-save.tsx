import { useState } from "react"
import { Button } from "@/kit/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/kit/ui/dialog"
import { Field, FieldLabel } from "@/kit/ui/field"
import { Input } from "@/kit/ui/input"
import type { ThemePreset } from "@/kit/theme/preset"

export function ThemeSave({
  preset,
  names,
  error,
  onSave,
  disabled,
}: {
  preset: ThemePreset
  names: string[]
  error: string
  onSave: (preset: ThemePreset) => boolean
  disabled: boolean
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(preset.name)
  const replacing = names.includes(name.trim())

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (value) setName(preset.name)
        setOpen(value)
      }}
    >
      <DialogTrigger render={<Button disabled={disabled} />}>
        Save preset
      </DialogTrigger>
      <DialogContent className="theme-save">
        <DialogHeader>
          <DialogTitle>Save preset</DialogTitle>
          <DialogDescription>
            Keep this preset on this device. Your site appearance stays
            unchanged.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault()

            if (name.trim() && onSave({ ...preset, name: name.trim() }))
              setOpen(false)
          }}
        >
          <Field>
            <FieldLabel htmlFor="preset-name">Preset name</FieldLabel>
            <Input
              id="preset-name"
              value={name}
              required
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          {error && (
            <p role="alert" className="theme-hint">
              {error}
            </p>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={!name.trim()}>
              {replacing ? "Replace saved preset" : "Save preset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
