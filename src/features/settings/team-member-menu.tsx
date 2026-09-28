import { useRef } from "react"
import { Ellipsis } from "lucide-react"
import { Button } from "@/kit/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/kit/ui/dropdown-menu"
import type { TeamPerson, MemberAction } from "./member-dialog"

export function TeamMemberMenu({
  member,
  currentUserId,
  onAction,
}: {
  member: TeamPerson
  currentUserId: string
  onAction: (action: MemberAction) => void
}) {
  const handoff = useRef(false)
  const trigger = useRef<HTMLButtonElement>(null)

  function choose(kind: MemberAction["kind"]) {
    handoff.current = true
    trigger.current?.focus({ preventScroll: true })
    onAction({ kind, member })
  }

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) handoff.current = false
      }}
    >
      <DropdownMenuTrigger
        ref={trigger}
        id={`team-action-${member.id}`}
        aria-label={`Actions for ${member.name}`}
        render={<Button variant="ghost" size="icon-sm" />}
      >
        <Ellipsis aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" finalFocus={() => !handoff.current}>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => choose("role")}>
            Change role
          </DropdownMenuItem>
          {member.id !== currentUserId && (
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => choose("remove")}
            >
              Remove member
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
