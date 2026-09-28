import { useRef, useState } from "react"
import { Field, FieldLabel } from "@/kit/ui/field"
import { Input } from "@/kit/ui/input"
import type { WorkspaceIdentity } from "@/demo/use-workspace-identity"
import { IdentityImage } from "./identity-image"
import { SettingsActions } from "./settings-actions"

export function WorkspaceSettings({
  value,
  revision,
  dirty,
  onChange,
  onSave,
  onCancel,
}: {
  value: WorkspaceIdentity
  revision: number
  dirty: boolean
  onChange: (value: WorkspaceIdentity) => void
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
          nameInput.current?.setCustomValidity("Enter a workspace name.")
          nameInput.current?.reportValidity()
        }
      }}
    >
      <header className="settings-section-heading">
        <h2 id="settings-title">Workspace</h2>
      </header>
      <IdentityImage
        key={revision}
        name={value.name}
        value={value.logo}
        label="logo"
        onChange={(logo) => onChange({ ...value, logo })}
      />
      <Field className="workspace-name-field">
        <FieldLabel htmlFor="workspace-name">Workspace name</FieldLabel>
        <Input
          id="workspace-name"
          name="organization"
          autoComplete="organization"
          required
          ref={nameInput}
          value={value.name}
          onChange={(event) => {
            event.target.setCustomValidity("")
            onChange({ ...value, name: event.target.value })
          }}
        />
      </Field>
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
