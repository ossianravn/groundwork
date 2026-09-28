import { Send } from "lucide-react"
import { Button } from "@/kit/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/kit/ui/dialog"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/kit/ui/field"
import { Input } from "@/kit/ui/input"
import { Textarea } from "@/kit/ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"
import type { Member, Project } from "@/demo/model"
import type { MessageDraft } from "@/demo/inbox"

function AddressField({
  label,
  id,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string
  id: string
  value: string
  options: { value: string; label: string }[]
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        items={options}
        value={value}
        onValueChange={(next) => onChange(next ?? "")}
      >
        <SelectTrigger id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}

export function MessageComposer({
  open,
  onOpenChange,
  draft,
  onChange,
  onDiscard,
  onSend,
  error,
  members,
  projects,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  draft: MessageDraft
  onChange: (patch: Partial<MessageDraft>) => void
  onDiscard: () => void
  onSend: () => void
  error: string
  members: Member[]
  projects: Project[]
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="message-compose-dialog"
        showCloseButton={false}
        aria-describedby={undefined}
        finalFocus={() =>
          document.getElementById("inbox-message-title") ??
          document.getElementById("inbox-compose")
        }
      >
        <DialogHeader showCloseButton>
          <DialogTitle>New message</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            onSend()
          }}
        >
          <FieldGroup className="message-compose-fields">
            <div className="message-compose-address">
              <AddressField
                label="To"
                placeholder="Choose a member"
                id="message-recipient"
                value={draft.recipientId}
                options={members.map((member) => ({
                  value: member.id,
                  label: member.name,
                }))}
                onChange={(recipientId) => onChange({ recipientId })}
              />
              <AddressField
                label="Project (optional)"
                placeholder="No project"
                id="message-project"
                value={draft.projectId}
                options={[
                  { value: "", label: "No project" },
                  ...projects.map((project) => ({
                    value: project.id,
                    label: project.name,
                  })),
                ]}
                onChange={(projectId) => onChange({ projectId })}
              />
            </div>
            <Field>
              <FieldLabel htmlFor="message-subject">Subject</FieldLabel>
              <Input
                id="message-subject"
                name="subject"
                required
                value={draft.subject}
                onChange={(event) => onChange({ subject: event.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="message-body">Message</FieldLabel>
              <Textarea
                id="message-body"
                name="body"
                required
                rows={6}
                value={draft.body}
                onChange={(event) => onChange({ body: event.target.value })}
              />
            </Field>
            {error && <FieldError role="alert">{error}</FieldError>}
          </FieldGroup>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onDiscard}>
              Cancel
            </Button>
            <Button type="submit">
              <Send data-icon="inline-start" aria-hidden="true" />
              Send message
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ReplyComposer({
  recipient,
  value,
  onChange,
  onSend,
  error,
}: {
  recipient: string
  value: string
  onChange: (value: string) => void
  onSend: () => void
  error: string
}) {
  return (
    <form
      className="inbox-reply"
      onSubmit={(event) => {
        event.preventDefault()
        onSend()
      }}
    >
      <Field>
        <FieldLabel htmlFor="inbox-reply">Reply to {recipient}</FieldLabel>
        <Textarea
          id="inbox-reply"
          name="reply"
          value={value}
          required
          rows={3}
          onChange={(event) => onChange(event.target.value)}
        />
        {error && <FieldError role="alert">{error}</FieldError>}
      </Field>
      <div className="inbox-reply-actions">
        {value && (
          <Button
            variant="ghost"
            type="button"
            onClick={() => {
              onChange("")
              document.getElementById("inbox-reply")?.focus()
            }}
          >
            Cancel
          </Button>
        )}
        <Button type="submit">
          <Send data-icon="inline-start" aria-hidden="true" />
          Send reply
        </Button>
      </div>
    </form>
  )
}
