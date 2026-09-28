import { useState } from "react"
import { Button } from "@/kit/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/kit/ui/dialog"
import { Field, FieldLabel } from "@/kit/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"
import type { Member } from "@/demo/model"
import type { MemberChange, TeamRole, TeamResult } from "@/demo/team"
import { RoleSelect } from "./role-select"

export type TeamPerson = Member & { email: string; role: TeamRole }

export type MemberAction = { kind: "role" | "remove"; member: TeamPerson }

export function MemberDialog({
  action,
  members,
  projectCount,
  onChange,
  onClose,
}: {
  action: MemberAction
  members: Member[]
  projectCount: number
  onChange: (memberId: string, change: MemberChange) => TeamResult
  onClose: () => void
}) {
  const [role, setRole] = useState(action.member.role)
  const [open, setOpen] = useState(true)
  const [replacementId, setReplacementId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const removing = action.kind === "remove"

  const replacements = members.filter(
    (member) => member.id !== action.member.id,
  )

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      onOpenChangeComplete={(next) => {
        if (!next) onClose()
      }}
    >
      <DialogContent
        showCloseButton={false}
        finalFocus={() =>
          document.getElementById(`team-action-${action.member.id}`) ??
          document.getElementById("team-search")
        }
      >
        <DialogHeader showCloseButton>
          <DialogTitle>
            {removing ? "Remove member" : "Change role"}
          </DialogTitle>
          <DialogDescription>
            {action.member.name} · {action.member.email}
          </DialogDescription>
        </DialogHeader>
        <form
          className="settings-form"
          onSubmit={(event) => {
            event.preventDefault()

            const result = onChange(
              action.member.id,
              removing
                ? { kind: "remove", replacementId: replacementId ?? "" }
                : { kind: "role", role },
            )

            if (result.ok) setOpen(false)
            else setError(result.message)
          }}
        >
          {removing ? (
            <>
              <p>
                {projectCount
                  ? `Reassign ${projectCount} ${projectCount === 1 ? "project" : "projects"} before removing this member.`
                  : "Remove this person from the workspace team?"}
              </p>
              {projectCount > 0 && (
                <Field>
                  <FieldLabel htmlFor="replacement-owner">
                    New project owner
                  </FieldLabel>
                  <Select
                    value={replacementId}
                    onValueChange={(value) => {
                      setReplacementId(value)
                      setError("")
                    }}
                  >
                    <SelectTrigger id="replacement-owner">
                      <SelectValue placeholder="Choose a member">
                        {
                          replacements.find(
                            (member) => member.id === replacementId,
                          )?.name
                        }
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {replacements.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </>
          ) : (
            <Field>
              <FieldLabel htmlFor="member-role">Role</FieldLabel>
              <RoleSelect
                id="member-role"
                value={role}
                onChange={(value) => {
                  setRole(value)
                  setError("")
                }}
              />
            </Field>
          )}
          {error && (
            <p role="alert" className="settings-error">
              {error}
            </p>
          )}
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button
              type="submit"
              variant={removing ? "destructive" : "default"}
            >
              {removing ? "Remove member" : "Save role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
