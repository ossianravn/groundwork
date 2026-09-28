import { Button } from "@/kit/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/kit/ui/field"
import { Input } from "@/kit/ui/input"

export function EmailLinkForm({
  email,
  onChange,
  onSubmit,
}: {
  email: string
  onChange: (email: string) => void
  onSubmit: () => void
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="sign-in-email">Email</FieldLabel>
          <Input
            id="sign-in-email"
            name="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => onChange(event.target.value)}
          />
        </Field>
      </FieldGroup>
      <Button type="submit">Send sign-in link</Button>
    </form>
  )
}
