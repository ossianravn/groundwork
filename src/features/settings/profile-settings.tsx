import { useRef, useState } from "react"
import { Field, FieldGroup, FieldLabel } from "@/kit/ui/field"
import { Input } from "@/kit/ui/input"
import { Textarea } from "@/kit/ui/textarea"
import type { AccountProfile } from "@/demo/use-account"
import { IdentityImage } from "./identity-image"
import { SettingsActions } from "./settings-actions"

export function ProfileSettings({
  profile,
  revision,
  email,
  dirty,
  onChange,
  onSave,
  onCancel,
}: {
  profile: AccountProfile
  revision: number
  email: string
  dirty: boolean
  onChange: (profile: Partial<AccountProfile>) => void
  onSave: () => boolean
  onCancel: () => void
}) {
  const [saved, setSaved] = useState(false)
  const nameInput = useRef<HTMLInputElement>(null)

  return (
    <form
      className="settings-form"
      onSubmit={(event) => {
        event.preventDefault()

        if (onSave()) setSaved(true)
        else {
          nameInput.current?.setCustomValidity("Enter your name.")
          nameInput.current?.reportValidity()
        }
      }}
    >
      <header className="settings-section-heading">
        <h2 id="settings-title">Profile</h2>
        <p>Your name and photo appear alongside your work.</p>
      </header>
      <IdentityImage
        key={revision}
        name={profile.name}
        value={profile.avatar}
        label="photo"
        onChange={(avatar) => onChange({ avatar })}
      />
      <FieldGroup>
        <div className="settings-identity">
          <Field className="settings-name">
            <FieldLabel htmlFor="account-name">Name</FieldLabel>
            <Input
              ref={nameInput}
              id="account-name"
              name="name"
              autoComplete="name"
              required
              value={profile.name}
              onChange={(event) => {
                event.target.setCustomValidity("")
                onChange({ name: event.target.value })
              }}
            />
          </Field>
          <div className="settings-email">
            <span>Email</span>
            <p>{email}</p>
            <small>Demo account</small>
          </div>
        </div>
        <Field>
          <FieldLabel htmlFor="account-bio">
            Bio <span className="text-muted-foreground">(optional)</span>
          </FieldLabel>
          <Textarea
            id="account-bio"
            name="bio"
            rows={3}
            value={profile.bio}
            onChange={(event) => onChange({ bio: event.target.value })}
          />
        </Field>
      </FieldGroup>
      <SettingsActions
        dirty={dirty}
        saved={saved}
        onCancel={() => {
          onCancel()
          setSaved(false)
          nameInput.current?.setCustomValidity("")
        }}
      />
    </form>
  )
}
