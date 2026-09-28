import { useRef, useState, type RefObject } from "react"
import { Button } from "@/kit/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/kit/ui/dialog"
import { Field, FieldLabel, FieldGroup, FieldError } from "@/kit/ui/field"
import { Input } from "@/kit/ui/input"
import type { TeamRole, TeamResult } from "@/demo/team"
import { RoleSelect } from "./role-select"
import { UserPlus } from "lucide-react"

export function InviteDialog({
  onInvite,
  createdFocus,
}: {
  onInvite: (email: string, role: TeamRole) => TeamResult
  createdFocus: RefObject<HTMLLIElement | null>
}) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<TeamRole>("member")
  const [error, setError] = useState("")
  const input = useRef<HTMLInputElement>(null)
  const created = useRef(false)

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)

        if (next) {
          created.current = false
          setEmail("")
          setRole("member")
          setError("")
        }
      }}
    >
      <DialogTrigger render={<Button />}>
        <UserPlus aria-hidden="true" />
        Invite member
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        finalFocus={() => (created.current ? createdFocus.current : true)}
      >
        <DialogHeader showCloseButton>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            Creates a pending invitation in this demo. No email is sent.
          </DialogDescription>
        </DialogHeader>
        <form
          className="settings-form"
          onSubmit={(event) => {
            event.preventDefault()
            const result = onInvite(email, role)

            if (result.ok) {
              created.current = true
              setOpen(false)
            } else {
              setError(result.message)
              input.current?.focus()
            }
          }}
        >
          <FieldGroup>
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="invite-email">Email</FieldLabel>
              <Input
                id="invite-email"
                ref={input}
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setError("")
                }}
                aria-invalid={!!error}
                aria-describedby={error ? "invite-error" : undefined}
              />
              {error && <FieldError id="invite-error">{error}</FieldError>}
            </Field>
            <Field>
              <FieldLabel htmlFor="invite-role">Role</FieldLabel>
              <RoleSelect
                id="invite-role"
                value={role}
                onChange={setRole}
                includeOwner={false}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit">Create invitation</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
