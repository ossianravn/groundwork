import { useEffect, useRef, useState } from "react"
import { Check } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/kit/ui/field"
import { Input } from "@/kit/ui/input"
import { Textarea } from "@/kit/ui/textarea"
import type { PublicLinkComponent } from "@/components/public-link"
import type { ContactState, ContactValues } from "@/demo/use-contact"

export function ContactForm({
  state,
  failureMessage,
  onChange,
  onSubmit,
  onRestart,
  LinkComponent,
}: {
  state: ContactState
  failureMessage: string
  onChange: (field: keyof ContactValues, value: string) => void
  onSubmit: () => void
  onRestart: () => void
  LinkComponent: PublicLinkComponent
}) {
  const [errors, setErrors] = useState({ email: "", message: "" })
  const result = useRef<HTMLDivElement>(null)
  const firstField = useRef<HTMLInputElement>(null)
  const previousStatus = useRef(state.status)

  useEffect(() => {
    if (state.status !== previousStatus.current) {
      const target =
        state.status === "editing" ? firstField.current : result.current

      target?.focus()
      previousStatus.current = state.status
    }
  }, [state.status])

  if (state.status === "complete") {
    return (
      <section
        className="contact-complete"
        aria-labelledby="contact-complete-title"
      >
        <div ref={result} tabIndex={-1} className="contact-result">
          <Check aria-hidden="true" />
          <h2 id="contact-complete-title">Demo submission complete</h2>
          <p>
            No message was sent. You can try the form again or explore the demo.
          </p>
        </div>
        <div className="contact-actions">
          <Button onClick={onRestart}>Try another message</Button>
          <LinkComponent destination="demo">Open demo</LinkComponent>
        </div>
      </section>
    )
  }

  const { values } = state

  return (
    <form
      className="contact-form"
      aria-label="Contact"
      aria-describedby="contact-demo-note"
      onInvalidCapture={(event) => {
        const field = event.target

        if (
          (field instanceof HTMLInputElement ||
            field instanceof HTMLTextAreaElement) &&
          (field.name === "email" || field.name === "message")
        ) {
          setErrors((current) => ({
            ...current,
            [field.name]: field.validationMessage,
          }))
        }
      }}
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <FieldGroup className="contact-fields">
        <Field>
          <FieldLabel htmlFor="contact-name">
            Name{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </FieldLabel>
          <Input
            ref={firstField}
            id="contact-name"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(event) => onChange("name", event.target.value)}
          />
        </Field>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="contact-email">Email</FieldLabel>
          <Input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={values.email}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            onChange={(event) => {
              onChange("email", event.target.value)
              setErrors((current) => ({ ...current, email: "" }))
            }}
          />
          {errors.email && (
            <FieldError id="contact-email-error">{errors.email}</FieldError>
          )}
        </Field>
        <Field className="contact-full-row">
          <FieldLabel htmlFor="contact-subject">
            Subject{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </FieldLabel>
          <Input
            id="contact-subject"
            name="subject"
            value={values.subject}
            onChange={(event) => onChange("subject", event.target.value)}
          />
        </Field>
        <Field className="contact-full-row" data-invalid={!!errors.message}>
          <FieldLabel htmlFor="contact-message">Message</FieldLabel>
          <Textarea
            id="contact-message"
            name="message"
            rows={6}
            required
            value={values.message}
            aria-invalid={!!errors.message}
            aria-describedby={
              errors.message ? "contact-message-error" : undefined
            }
            onChange={(event) => {
              onChange("message", event.target.value)
              setErrors((current) => ({ ...current, message: "" }))
            }}
          />
          {errors.message && (
            <FieldError id="contact-message-error">{errors.message}</FieldError>
          )}
        </Field>
      </FieldGroup>
      <div className="contact-submit">
        <p id="contact-demo-note">
          Demo form. Your message stays in this tab and is never sent.
        </p>
        {state.status === "failed" && (
          <div ref={result} tabIndex={-1} className="contact-error">
            <FieldError>{failureMessage}</FieldError>
          </div>
        )}
        <div className="contact-actions">
          <Button type="submit">
            {state.status === "failed" ? "Try again" : "Submit demo message"}
          </Button>
          <LinkComponent destination="privacy">Privacy</LinkComponent>
        </div>
      </div>
    </form>
  )
}
