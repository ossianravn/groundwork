import type { ReactNode } from "react"
import { Button } from "@/kit/ui/button"
import { Field, FieldLabel, FieldGroup } from "@/kit/ui/field"
import { Input } from "@/kit/ui/input"
import { PasswordField } from "./password-field"

function EmailField({ email }: { email: string }) {
  return (
    <Field>
      <FieldLabel htmlFor="email">Email</FieldLabel>
      <Input
        id="email"
        name="email"
        type="email"
        autoComplete="username"
        defaultValue={email}
        required
      />
    </Field>
  )
}

export function SignInForm({
  email,
  recoveryLink,
  onSubmit,
}: {
  email: string
  recoveryLink: ReactNode
  onSubmit: () => void
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.currentTarget.reset()
        onSubmit()
      }}
    >
      <FieldGroup>
        <EmailField email={email} />
        <PasswordField recoveryLink={recoveryLink} />
      </FieldGroup>
      <Button type="submit">Sign in</Button>
    </form>
  )
}

export function SignUpForm({
  initial,
  onChange,
  onSubmit,
}: {
  initial: { name: string; email: string }
  onChange: (profile: { name: string; email: string }) => void
  onSubmit: (profile: { name: string; email: string }) => void
}) {
  return (
    <form
      onChange={(event) => {
        const data = new FormData(event.currentTarget)
        onChange({
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
        })
      }}
      onSubmit={(event) => {
        event.preventDefault()
        const data = new FormData(event.currentTarget)
        const name = String(data.get("name")).trim()

        if (!name) {
          const field =
            event.currentTarget.querySelector<HTMLInputElement>("#name")

          field?.setCustomValidity("Enter your name.")
          field?.reportValidity()

          return
        }

        const email = String(data.get("email")).trim()
        event.currentTarget.reset()
        onSubmit({ name, email })
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Full name</FieldLabel>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            defaultValue={initial.name}
            required
            onInput={(event) => event.currentTarget.setCustomValidity("")}
          />
        </Field>
        <EmailField email={initial.email} />
        <PasswordField creating />
      </FieldGroup>
      <Button type="submit">Create account</Button>
    </form>
  )
}

export function RecoveryForm({ onSubmit }: { onSubmit: () => void }) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.currentTarget.reset()
        onSubmit()
      }}
    >
      <EmailField email="" />
      <Button type="submit">Send reset link</Button>
    </form>
  )
}

export function ResetPasswordForm({ onSubmit }: { onSubmit: () => void }) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        event.currentTarget.reset()
        onSubmit()
      }}
    >
      <PasswordField creating />
      <Button type="submit">Reset password</Button>
    </form>
  )
}

export function WorkspaceSetupForm({
  name,
  onChange,
  onSubmit,
}: {
  name: string
  onChange: (name: string) => void
  onSubmit: () => void
}) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()

        const field =
          event.currentTarget.querySelector<HTMLInputElement>("#workspace")

        if (!name.trim()) {
          field?.setCustomValidity("Enter a workspace name.")
          field?.reportValidity()

          return
        }

        onSubmit()
      }}
    >
      <Field>
        <FieldLabel htmlFor="workspace">Workspace name</FieldLabel>
        <Input
          id="workspace"
          name="workspace"
          autoComplete="organization"
          required
          value={name}
          onChange={(event) => {
            event.target.setCustomValidity("")
            onChange(event.target.value)
          }}
        />
      </Field>
      <Button type="submit">Continue</Button>
    </form>
  )
}
