import { useState } from "react"
import { Pencil } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { DatePicker } from "@/kit/ui/date-picker"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/kit/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/kit/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"
import type { Member, Project } from "@/demo/model"
import type {
  ProjectFieldErrors,
  ProjectSaveResult,
  ProjectValues,
} from "@/demo/project-form"
import { ProjectLinkFields } from "./project-link-fields"
import { ProjectTagField } from "./project-tag-field"

type Details = Pick<ProjectValues, "ownerId" | "dueDate" | "tags" | "links">

const detailsOf = ({ ownerId, dueDate, tags, links }: Project): Details => ({
  ownerId,
  dueDate,
  tags,
  links,
})

/**
 * One Edit action for the project's properties: owner, due date, tags and
 * links change together in a dialog and save at once. Cancel discards the
 * changes; a failed save keeps them and offers Retry.
 */
export function ProjectDetailsDialog({
  project,
  members,
  tagOptions,
  onSave,
  onSaved,
}: {
  project: Project
  members: Member[]
  tagOptions: string[]
  onSave: (details: Details) => ProjectSaveResult
  onSaved: () => void
}) {
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState(() => detailsOf(project))
  const [errors, setErrors] = useState<ProjectFieldErrors>({})
  const [failure, setFailure] = useState("")

  const items = members.map((member) => ({
    value: member.id,
    label: member.name,
  }))

  function change<K extends keyof Details>(field: K, value: Details[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function openChange(next: boolean) {
    // Each opening starts from the saved project.
    if (next) {
      setValues(detailsOf(project))
      setErrors({})
      setFailure("")
    }

    setOpen(next)
  }

  function save() {
    const result = onSave(values)

    if (result.kind === "saved") {
      setOpen(false)
      onSaved()
    } else if (result.kind === "invalid") {
      setErrors(result.errors)
      setFailure("")
    } else setFailure(result.message)
  }

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogTrigger
        render={<Button variant="ghost" size="sm" />}
        aria-label="Edit details"
      >
        <Pencil aria-hidden="true" data-icon="inline-start" />
        Edit
      </DialogTrigger>
      <DialogContent className="project-details-dialog">
        <DialogHeader>
          <DialogTitle>Edit details</DialogTitle>
        </DialogHeader>
        <form
          id="project-details-form"
          noValidate
          className="project-details-form"
          onSubmit={(event) => {
            event.preventDefault()
            save()
          }}
        >
          <FieldGroup className="project-details-row">
            <Field data-invalid={!!errors.ownerId}>
              <FieldLabel htmlFor="details-owner">Owner</FieldLabel>
              <Select
                items={items}
                value={values.ownerId}
                onValueChange={(value) => {
                  if (value) change("ownerId", value)
                }}
              >
                <SelectTrigger
                  id="details-owner"
                  aria-invalid={!!errors.ownerId}
                  aria-describedby={
                    errors.ownerId ? "details-owner-error" : undefined
                  }
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
                <FieldError id="details-owner-error">
                  {errors.ownerId}
                </FieldError>
              )}
            </Field>
            <Field data-invalid={!!errors.dueDate}>
              <FieldLabel id="details-date-label" htmlFor="details-date">
                Due date
              </FieldLabel>
              <DatePicker
                id="details-date"
                labelledBy="details-date-label"
                value={values.dueDate}
                onValueChange={(value) => change("dueDate", value)}
                invalid={!!errors.dueDate}
                aria-describedby={
                  errors.dueDate ? "details-date-error" : undefined
                }
              />
              {errors.dueDate && (
                <FieldError id="details-date-error">
                  {errors.dueDate}
                </FieldError>
              )}
            </Field>
          </FieldGroup>
          <ProjectTagField
            tags={values.tags}
            options={tagOptions}
            onChange={(tags) => change("tags", tags)}
          />
          <ProjectLinkFields
            links={values.links}
            errors={errors.links}
            onChange={(links) => change("links", links)}
          />
        </form>
        <DialogFooter>
          {failure && (
            <p role="alert" className="project-save-error">
              {failure}
            </p>
          )}
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button type="submit" form="project-details-form">
            {failure ? "Retry save" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
