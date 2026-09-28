import { useRef, useState } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/kit/ui/field"
import { Input } from "@/kit/ui/input"
import { RoleSelect } from "@/features/settings/role-select"
import {
  newInvitationDraft,
  prepareSetupInvitations,
  type InvitationDraft,
  type InvitationErrors,
} from "@/demo/onboarding"
import type { Invitation } from "@/demo/team"

export function SetupInvitations({
  rows,
  accountEmail,
  onChange,
  onFinish,
}: {
  rows: InvitationDraft[]
  accountEmail: string
  onChange: (rows: InvitationDraft[]) => void
  onFinish: (invitations: Invitation[]) => void
}) {
  const [errors, setErrors] = useState<InvitationErrors>({})
  const addButton = useRef<HTMLButtonElement>(null)
  const hasInvites = rows.some((row) => row.email.trim())

  function change(row: InvitationDraft) {
    onChange(rows.map((current) => (current.id === row.id ? row : current)))
    setErrors({})
  }

  return (
    <form
      className="setup-invitations"
      onSubmit={(event) => {
        event.preventDefault()
        const result = prepareSetupInvitations(rows, accountEmail)

        if (result.ok) onFinish(result.invitations)
        else {
          setErrors(result.errors)
          const first = rows.find((row) => result.errors[row.id])

          if (first) document.getElementById(`setup-email-${first.id}`)?.focus()
        }
      }}
    >
      <FieldGroup>
        {rows.map((row, index) => (
          <div className="setup-invite-row" key={row.id}>
            <Field data-invalid={!!errors[row.id]}>
              <FieldLabel htmlFor={`setup-email-${row.id}`}>
                Email<span className="sr-only"> {index + 1}</span>
              </FieldLabel>
              <Input
                id={`setup-email-${row.id}`}
                type="email"
                autoComplete="off"
                name={`email-${row.id}`}
                placeholder="colleague@example.com"
                value={row.email}
                aria-invalid={!!errors[row.id]}
                aria-describedby={
                  errors[row.id] ? `setup-error-${row.id}` : undefined
                }
                onChange={(event) =>
                  change({ ...row, email: event.target.value })
                }
              />
              {errors[row.id] && (
                <FieldError id={`setup-error-${row.id}`}>
                  {errors[row.id]}
                </FieldError>
              )}
            </Field>
            <div className="setup-role-actions">
              <Field>
                <FieldLabel htmlFor={`setup-role-${row.id}`}>
                  Role<span className="sr-only"> {index + 1}</span>
                </FieldLabel>
                <RoleSelect
                  id={`setup-role-${row.id}`}
                  value={row.role}
                  includeOwner={false}
                  onChange={(role) => change({ ...row, role })}
                />
              </Field>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove invitation ${index + 1}`}
                onClick={() => {
                  onChange(rows.filter((current) => current.id !== row.id))
                  setErrors({})
                  requestAnimationFrame(() => {
                    const next = rows[index + 1] ?? rows[index - 1]

                    if (next)
                      document.getElementById(`setup-email-${next.id}`)?.focus()
                    else addButton.current?.focus()
                  })
                }}
              >
                <X />
              </Button>
            </div>
          </div>
        ))}
      </FieldGroup>
      <Button
        ref={addButton}
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          const row = newInvitationDraft()
          onChange([...rows, row])
          requestAnimationFrame(() =>
            document.getElementById(`setup-email-${row.id}`)?.focus(),
          )
        }}
      >
        <Plus data-icon="inline-start" />
        Add another
      </Button>
      <div className="setup-actions">
        <Button type="button" variant="ghost" onClick={() => onFinish([])}>
          Skip for now
        </Button>
        <Button type="submit" disabled={!hasInvites}>
          Create invitations
        </Button>
      </div>
    </form>
  )
}
