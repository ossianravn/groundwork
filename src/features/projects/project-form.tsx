import { useRef, useState } from "react"
import { ProjectExtraFields } from "./project-extra-fields"
import { Button } from "@/kit/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/kit/ui/field"
import { Input } from "@/kit/ui/input"
import { RichTextEditor } from "@/kit/rich-text/rich-text-editor"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"
import type { Member } from "@/demo/model"
import type {
  ProjectFieldErrors,
  ProjectSaveResult,
  ProjectValues,
} from "@/demo/project-form"

export function ProjectForm({
  values,
  members,
  tagOptions,
  errors,
  failure,
  dirty,
  creating,
  onChange,
  onSave,
  onCancel,
}: {
  values: ProjectValues
  members: Member[]
  tagOptions: string[]
  errors: ProjectFieldErrors
  failure: string
  dirty: boolean
  creating: boolean
  onChange: <K extends keyof ProjectValues>(
    field: K,
    value: ProjectValues[K],
  ) => void
  onSave: () => ProjectSaveResult
  onCancel: () => void
}) {
  const form = useRef<HTMLFormElement>(null)

  const [extrasOpen, setExtrasOpen] = useState(
    values.tags.length > 0 || values.links.length > 0,
  )

  const items = members.map((member) => ({
    value: member.id,
    label: member.name,
  }))

  return (
    <form
      ref={form}
      className="project-editor-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const result = onSave()

        if (result.kind === "invalid") {
          const field = result.errors.name
            ? "name"
            : result.errors.ownerId
              ? "ownerId"
              : result.errors.dueDate
                ? "dueDate"
                : undefined

          if (field) {
            form.current
              ?.querySelector<HTMLElement>(`#edit-project-${field}`)
              ?.focus()
          } else if (result.errors.links) {
            setExtrasOpen(true)
            const id = Object.keys(result.errors.links)[0]
            requestAnimationFrame(() =>
              form.current
                ?.querySelector<HTMLInputElement>(`#project-link-${id}`)
                ?.focus(),
            )
          }
        } else if (result.kind === "rejected") {
          requestAnimationFrame(() =>
            form.current
              ?.querySelector<HTMLElement>("#project-save-error")
              ?.focus(),
          )
        }
      }}
    >
      <FieldGroup className="project-editor-fields">
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="edit-project-name">Project name</FieldLabel>
          <Input
            id="edit-project-name"
            name="name"
            required
            autoComplete="off"
            value={values.name}
            onChange={(event) => onChange("name", event.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "edit-name-error" : undefined}
          />
          {errors.name && (
            <FieldError id="edit-name-error">{errors.name}</FieldError>
          )}
        </Field>
        <Field data-invalid={!!errors.ownerId}>
          <FieldLabel htmlFor="edit-project-ownerId">Owner</FieldLabel>
          <Select
            items={items}
            name="ownerId"
            value={values.ownerId}
            onValueChange={(value) => {
              if (value) onChange("ownerId", value)
            }}
          >
            <SelectTrigger
              id="edit-project-ownerId"
              aria-required="true"
              aria-invalid={!!errors.ownerId}
              aria-describedby={errors.ownerId ? "edit-owner-error" : undefined}
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
          {errors.ownerId && (
            <FieldError id="edit-owner-error">{errors.ownerId}</FieldError>
          )}
        </Field>
        <Field>
          <FieldLabel
            id="edit-description-label"
            htmlFor="edit-project-description"
          >
            Description{" "}
            <span className="text-muted-foreground">(optional)</span>
          </FieldLabel>
          <RichTextEditor
            id="edit-project-description"
            labelledBy="edit-description-label"
            value={values.description}
            onChange={(value) => onChange("description", value)}
          />
        </Field>
        <Field data-invalid={!!errors.dueDate}>
          <FieldLabel htmlFor="edit-project-dueDate">Due date</FieldLabel>
          <Input
            id="edit-project-dueDate"
            name="dueDate"
            type="date"
            required
            value={values.dueDate}
            onChange={(event) => onChange("dueDate", event.target.value)}
            aria-invalid={!!errors.dueDate}
            aria-describedby={errors.dueDate ? "edit-date-error" : undefined}
          />
          {errors.dueDate && (
            <FieldError id="edit-date-error">{errors.dueDate}</FieldError>
          )}
        </Field>
      </FieldGroup>
      <ProjectExtraFields
        values={values}
        tagOptions={tagOptions}
        errors={errors}
        open={extrasOpen}
        onOpenChange={setExtrasOpen}
        onChange={onChange}
      />
      <div className="project-editor-actions">
        {failure && (
          <p
            role="alert"
            id="project-save-error"
            tabIndex={-1}
            className="project-save-error"
          >
            {failure}
          </p>
        )}
        <span className="text-muted-foreground" role="status">
          {dirty ? "Unsaved changes" : ""}
        </span>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!creating && !dirty && !failure}>
          {failure
            ? "Retry save"
            : creating
              ? "Create project"
              : "Save changes"}
        </Button>
      </div>
    </form>
  )
}
