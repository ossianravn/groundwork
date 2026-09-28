import { useState, type ReactNode } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Field, FieldLabel } from "@/kit/ui/field"
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/kit/ui/input-group"

export function PasswordField({
  creating = false,
  recoveryLink,
}: {
  creating?: boolean
  recoveryLink?: ReactNode
}) {
  const [visible, setVisible] = useState(false)
  const id = creating ? "new-password" : "current-password"

  return (
    <Field>
      <div className="access-label-row">
        <FieldLabel htmlFor={id}>
          {creating ? "New password" : "Password"}
        </FieldLabel>
        {recoveryLink}
      </div>
      <InputGroup>
        <InputGroupInput
          id={id}
          name="password"
          type={visible ? "text" : "password"}
          autoComplete={id}
          required
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            type="button"
            size="icon-sm"
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            onClick={() => setVisible(!visible)}
          >
            {visible ? (
              <EyeOff aria-hidden="true" />
            ) : (
              <Eye aria-hidden="true" />
            )}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}
