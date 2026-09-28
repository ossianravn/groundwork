import { useRef, useState, type ComponentProps, type FormEvent } from "react"
import { Button } from "@/kit/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/kit/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/kit/ui/field"
import { Input } from "@/kit/ui/input"
import { Textarea } from "@/kit/ui/textarea"
import type { NewProject } from "@/demo/model"

import {
  validateProjectFields,
  type ProjectFieldErrors,
} from "@/demo/project-form"

export function NewProjectDialog({
  open,
  onOpenChange,
  onCreate,
  finalFocus,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (project: NewProject) => void
  finalFocus?: ComponentProps<typeof DialogContent>["finalFocus"]
}) {
  const [errors, setErrors] = useState<ProjectFieldErrors>({})
  const nameRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)

  function changeOpen(next: boolean) {
    if (!next) setErrors({})
    onOpenChange(next)
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const name = String(data.get("name") ?? "").trim()
    const description = String(data.get("description") ?? "").trim()
    const dueDate = String(data.get("dueDate") ?? "")

    const next = validateProjectFields({ name, dueDate })

    setErrors(next)

    if (next.name) {
      nameRef.current?.focus()

      return
    }

    if (next.dueDate) {
      dateRef.current?.focus()

      return
    }

    onCreate({ name, description, dueDate })
    form.reset()
    changeOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent finalFocus={finalFocus} showCloseButton={false}>
        <DialogHeader showCloseButton>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>
            Create a project in this demo session. It will reset when you
            reload.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate>
          <FieldGroup className="project-form-fields">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="project-name">Project name</FieldLabel>
              <Input
                ref={nameRef}
                id="project-name"
                autoComplete="off"
                required
                name="name"
                onChange={(event) => {
                  if (errors.name && event.target.value.trim()) {
                    setErrors((current) => ({ ...current, name: "" }))
                  }
                }}
                aria-invalid={!!errors.name}
                aria-describedby={
                  errors.name ? "project-name-error" : undefined
                }
              />
              {errors.name && (
                <FieldError id="project-name-error">{errors.name}</FieldError>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="project-description">
                Description{" "}
                <span className="text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Textarea id="project-description" name="description" />
            </Field>
            <Field data-invalid={!!errors.dueDate}>
              <FieldLabel htmlFor="project-due-date">Due date</FieldLabel>
              <Input
                ref={dateRef}
                id="project-due-date"
                type="date"
                required
                name="dueDate"
                onChange={(event) => {
                  if (errors.dueDate && event.target.validity.valid) {
                    setErrors((current) => ({ ...current, dueDate: "" }))
                  }
                }}
                aria-invalid={!!errors.dueDate}
                aria-describedby={
                  errors.dueDate ? "project-date-error" : undefined
                }
              />
              {errors.dueDate && (
                <FieldError id="project-date-error">
                  {errors.dueDate}
                </FieldError>
              )}
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => changeOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create project</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
