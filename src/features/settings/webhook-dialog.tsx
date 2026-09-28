import { useRef, useState, type RefObject } from "react"
import { Button } from "@/kit/ui/button"
import { Input } from "@/kit/ui/input"
import { Checkbox } from "@/kit/ui/checkbox"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldSet,
  FieldLegend,
} from "@/kit/ui/field"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/kit/ui/dialog"
import {
  webhookErrors,
  webhookEvents,
  type Webhook,
  type WebhookValues,
} from "@/demo/integrations"

export function WebhookDialog({
  webhook,
  onSave,
  onClose,
  returnFocus,
}: {
  webhook: Webhook | null
  onSave: (id: string | null, values: WebhookValues) => void
  onClose: () => void
  returnFocus: RefObject<HTMLElement | null>
}) {
  const [values, setValues] = useState<WebhookValues>(
    webhook ?? { name: "", url: "", events: [] },
  )

  const [errors, setErrors] = useState({ name: "", url: "", events: "" })
  const nameInput = useRef<HTMLInputElement>(null)
  const urlInput = useRef<HTMLInputElement>(null)
  const eventInput = useRef<HTMLButtonElement>(null)

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent showCloseButton={false} finalFocus={returnFocus}>
        <DialogHeader showCloseButton>
          <DialogTitle>
            {webhook ? "Edit endpoint" : "Add endpoint"}
          </DialogTitle>
          <DialogDescription>
            Tests are simulated. No requests are sent to this URL.
          </DialogDescription>
        </DialogHeader>
        <form
          className="settings-form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            const next = webhookErrors(values)
            setErrors(next)

            if (next.name) nameInput.current?.focus()
            else if (next.url) urlInput.current?.focus()
            else if (next.events) eventInput.current?.focus()
            else {
              onSave(webhook?.id ?? null, values)
              onClose()
            }
          }}
        >
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="endpoint-name">Name</FieldLabel>
              <Input
                id="endpoint-name"
                required
                ref={nameInput}
                value={values.name}
                onChange={(event) => {
                  setValues({ ...values, name: event.target.value })
                  setErrors({ ...errors, name: "" })
                }}
                aria-invalid={!!errors.name}
                aria-describedby={
                  errors.name ? "endpoint-name-error" : undefined
                }
              />
              {errors.name && (
                <FieldError id="endpoint-name-error">{errors.name}</FieldError>
              )}
            </Field>
            <Field data-invalid={!!errors.url}>
              <FieldLabel htmlFor="endpoint-url">Endpoint URL</FieldLabel>
              <Input
                id="endpoint-url"
                required
                type="url"
                ref={urlInput}
                value={values.url}
                placeholder="https://example.com/webhook"
                onChange={(event) => {
                  setValues({ ...values, url: event.target.value })
                  setErrors({ ...errors, url: "" })
                }}
                aria-invalid={!!errors.url}
                aria-describedby={errors.url ? "endpoint-url-error" : undefined}
              />
              {errors.url && (
                <FieldError id="endpoint-url-error">{errors.url}</FieldError>
              )}
            </Field>
            <FieldSet
              aria-describedby={
                errors.events ? "endpoint-events-error" : undefined
              }
            >
              <FieldLegend>Events</FieldLegend>
              <FieldGroup className="integration-event-choices">
                {webhookEvents.map((event, index) => (
                  <Field
                    key={event}
                    orientation="horizontal"
                    data-invalid={!!errors.events}
                  >
                    <Checkbox
                      id={`event-${event}`}
                      ref={index === 0 ? eventInput : undefined}
                      checked={values.events.includes(event)}
                      aria-invalid={!!errors.events}
                      onCheckedChange={(checked) => {
                        setValues({
                          ...values,
                          events: checked
                            ? [...values.events, event]
                            : values.events.filter((value) => value !== event),
                        })
                        setErrors({ ...errors, events: "" })
                      }}
                    />
                    <FieldLabel htmlFor={`event-${event}`}>{event}</FieldLabel>
                  </Field>
                ))}
              </FieldGroup>
              {errors.events && (
                <FieldError id="endpoint-events-error">
                  {errors.events}
                </FieldError>
              )}
            </FieldSet>
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit">
              {webhook ? "Save changes" : "Add endpoint"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
