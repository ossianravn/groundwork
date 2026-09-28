import { useRef, useState } from "react"
import { Button } from "@/kit/ui/button"
import { Input } from "@/kit/ui/input"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/kit/ui/field"

export function InputExample() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  return (
    <form
      className="grid w-full max-w-sm gap-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()

        if (!input.current?.validity.valid) {
          setError("Enter a valid email address.")
          input.current?.focus()

          return
        }

        setSaved(true)
      }}
    >
      <FieldGroup>
        <Field data-invalid={!!error}>
          <FieldLabel htmlFor="example-email">Email</FieldLabel>
          <Input
            ref={input}
            id="example-email"
            type="email"
            required
            autoComplete="off"
            value={email}
            placeholder="ava@example.com"
            aria-invalid={!!error}
            aria-describedby={error ? "example-email-error" : undefined}
            onChange={(event) => {
              setEmail(event.target.value)
              setError("")
              setSaved(false)
            }}
          />
          {error && <FieldError id="example-email-error">{error}</FieldError>}
        </Field>
      </FieldGroup>
      <Button className="justify-self-start" type="submit">
        {saved ? "Saved in preview" : "Save email"}
      </Button>
    </form>
  )
}
