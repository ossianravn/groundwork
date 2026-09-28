import { useRef, useState, type ReactNode } from "react"
import { Pencil } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/kit/ui/field"
import { Input } from "@/kit/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"
import type { Member } from "@/demo/model"
import type { InlineProjectField } from "@/demo/project-draft"
import type { ProjectInlineEditing } from "./project-inline-editing"

const labels = { name: "Project name", ownerId: "Owner", dueDate: "Due date" }

export function ProjectInlineField({
  field,
  editing,
  members,
  children,
}: {
  field: InlineProjectField
  editing: ProjectInlineEditing
  members: Member[]
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState("")
  const [failure, setFailure] = useState("")
  const [announcement, setAnnouncement] = useState("")
  const trigger = useRef<HTMLButtonElement>(null)
  const form = useRef<HTMLFormElement>(null)
  const id = `inline-project-${field}`
  const dirty = editing.dirty(field)

  const items = members.map((member) => ({
    value: member.id,
    label: member.name,
  }))

  function close() {
    setOpen(false)
    requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }))
  }

  function cancel() {
    editing.cancel(field)
    close()
  }

  function change(value: string) {
    editing.change(field, value)
    setError("")
  }

  return (
    <div className="project-inline-field" data-field={field}>
      {open ? (
        <form
          ref={form}
          noValidate
          className="project-inline-form"
          onKeyDown={(event) => {
            if (
              event.key === "Escape" &&
              !event.defaultPrevented &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault()
              cancel()
            }
          }}
          onSubmit={(event) => {
            event.preventDefault()
            const result = editing.save(field)

            if (result.kind === "saved") {
              setAnnouncement(`${labels[field]} saved.`)
              close()
            } else if (result.kind === "invalid") {
              setError(
                result.errors[field] ??
                  "Review the project in the full editor before saving.",
              )
              form.current?.querySelector<HTMLElement>(`#${id}`)?.focus()
            } else {
              setFailure(result.message)
            }
          }}
        >
          {field === "name" && <h1 className="sr-only">{children}</h1>}
          <FieldGroup>
            <Field data-invalid={!!error}>
              <FieldLabel
                htmlFor={id}
                className={field === "name" ? undefined : "sr-only"}
              >
                {labels[field]}
              </FieldLabel>
              {field === "ownerId" ? (
                <Select
                  items={items}
                  value={editing.values.ownerId}
                  onValueChange={(value) => {
                    if (value) change(value)
                  }}
                >
                  <SelectTrigger
                    id={id}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${id}-error` : undefined}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    <SelectGroup>
                      {items.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={id}
                  name={field}
                  type={field === "dueDate" ? "date" : "text"}
                  required
                  autoComplete="off"
                  value={editing.values[field]}
                  onChange={(event) => change(event.target.value)}
                  aria-invalid={!!error}
                  aria-describedby={error ? `${id}-error` : undefined}
                />
              )}
              {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
            </Field>
          </FieldGroup>
          {failure && (
            <p role="alert" className="project-save-error">
              {failure}
            </p>
          )}
          <div className="project-inline-actions">
            <Button type="submit" size="sm">
              {failure ? "Retry save" : "Save"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={cancel}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="project-inline-value">
          {field === "name" ? <h1>{children}</h1> : children}
          <Button
            ref={trigger}
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${labels[field].toLowerCase()}`}
            aria-expanded={false}
            onClick={() => {
              setError("")
              setFailure("")
              setAnnouncement("")
              setOpen(true)
              requestAnimationFrame(() => document.getElementById(id)?.focus())
            }}
          >
            <Pencil aria-hidden="true" />
          </Button>
          {dirty && <span className="project-inline-draft">Unsaved</span>}
        </div>
      )}
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </div>
  )
}
