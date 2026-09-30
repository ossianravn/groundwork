import { useState, type FormEvent } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/kit/ui/button"
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
import { Input } from "@/kit/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"
import { RichTextEditor } from "@/kit/rich-text/rich-text-editor"
import { textDocument, type RichTextDocument } from "@/kit/rich-text/document"
import type { Member } from "@/demo/model"

const unassigned = "unassigned"

export interface TaskDraft {
  title: string
  assigneeId: string | null
  description: RichTextDocument
}

/**
 * Add task: a dialog with the title, an assignee and an optional
 * description. Each opening starts empty; a missing title is explained in
 * place.
 */
export function ProjectTaskDialog({
  members,
  onAdd,
}: {
  members: Member[]
  onAdd: (task: TaskDraft) => void
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [assigneeId, setAssigneeId] = useState(unassigned)
  const [description, setDescription] = useState(() => textDocument(""))
  const [error, setError] = useState("")

  const items = [
    { value: unassigned, label: "Unassigned" },
    ...members.map((member) => ({ value: member.id, label: member.name })),
  ]

  function openChange(next: boolean) {
    if (next) {
      setTitle("")
      setAssigneeId(unassigned)
      setDescription(textDocument(""))
      setError("")
    }

    setOpen(next)
  }

  function submit(event: FormEvent) {
    event.preventDefault()

    if (!title.trim()) {
      setError("Enter a title for the task.")
      document.getElementById("new-task-title")?.focus()

      return
    }

    onAdd({
      title,
      assigneeId: assigneeId === unassigned ? null : assigneeId,
      description,
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Plus aria-hidden="true" data-icon="inline-start" />
        Add task
      </DialogTrigger>
      <DialogContent className="project-task-dialog">
        <DialogHeader>
          <DialogTitle>Add task</DialogTitle>
        </DialogHeader>
        <form
          id="new-task-form"
          noValidate
          className="project-details-form"
          onSubmit={submit}
        >
          <FieldGroup className="project-details-row">
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="new-task-title">Title</FieldLabel>
              <Input
                id="new-task-title"
                autoFocus
                autoComplete="off"
                value={title}
                aria-invalid={!!error}
                aria-describedby={error ? "new-task-error" : undefined}
                onChange={(event) => {
                  setTitle(event.target.value)

                  if (error) setError("")
                }}
              />
              {error && <FieldError id="new-task-error">{error}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="new-task-assignee">Assignee</FieldLabel>
              <Select
                items={items}
                value={assigneeId}
                onValueChange={(value) => setAssigneeId(value ?? unassigned)}
              >
                <SelectTrigger id="new-task-assignee">
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
            </Field>
          </FieldGroup>
          <Field>
            <FieldLabel id="new-task-description-label">
              Description{" "}
              <span className="text-muted-foreground">(optional)</span>
            </FieldLabel>
            <RichTextEditor
              id="new-task-description"
              labelledBy="new-task-description-label"
              value={description}
              onChange={setDescription}
            />
          </Field>
        </form>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button type="submit" form="new-task-form">
            Add task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
