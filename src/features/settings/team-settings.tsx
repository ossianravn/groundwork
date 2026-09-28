import { useRef, useState } from "react"
import { Ellipsis, Search } from "lucide-react"
import { MemberAvatar } from "@/kit/member-avatar"
import { Button } from "@/kit/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/kit/ui/input-group"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/kit/ui/dropdown-menu"
import {
  roleLabels,
  type Invitation,
  type MemberChange,
  type TeamResult,
  type TeamRole,
} from "@/demo/team"
import type { Project } from "@/demo/model"
import { InviteDialog } from "./invite-dialog"
import {
  MemberDialog,
  type MemberAction,
  type TeamPerson,
} from "./member-dialog"
import { TeamMemberMenu } from "./team-member-menu"

export function TeamSettings({
  members,
  invitations,
  currentUserId,
  projects,
  onInvite,
  onRevoke,
  onChange,
}: {
  members: TeamPerson[]
  invitations: Invitation[]
  currentUserId: string
  projects: Project[]
  onInvite: (email: string, role: TeamRole) => TeamResult
  onRevoke: (id: string) => void
  onChange: (memberId: string, change: MemberChange) => TeamResult
}) {
  const [query, setQuery] = useState("")
  const [action, setAction] = useState<MemberAction | null>(null)
  const [announcement, setAnnouncement] = useState("")
  const search = useRef<HTMLInputElement>(null)
  const latestInvitation = useRef<HTMLLIElement>(null)

  const matches = (value: string) =>
    value.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())

  const visibleMembers = members.filter((member) =>
    matches(`${member.name} ${member.email}`),
  )

  const visibleInvitations = invitations.filter((invitation) =>
    matches(invitation.email),
  )

  return (
    <div className="team-settings">
      <header className="settings-section-heading team-heading">
        <h2 id="settings-title">
          Team <span className="team-count">{members.length}</span>
        </h2>
        <InviteDialog
          createdFocus={latestInvitation}
          onInvite={(email, role) => {
            const result = onInvite(email, role)

            if (result.ok) {
              setQuery("")
              setAnnouncement(`Invitation created for ${email}.`)
            }

            return result
          }}
        />
      </header>
      <InputGroup className="team-search">
        <InputGroupAddon>
          <Search aria-hidden="true" />
        </InputGroupAddon>
        <InputGroupInput
          id="team-search"
          ref={search}
          aria-label="Search team"
          placeholder="Search team…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </InputGroup>
      <ul className="team-list" aria-label="Members">
        {visibleMembers.map((member) => (
          <li key={member.id} className="team-row">
            <MemberAvatar member={member} />
            <div className="team-person">
              <p>
                {member.name}
                {member.id === currentUserId && (
                  <span className="team-you">You</span>
                )}
              </p>
              <span>{member.email}</span>
            </div>
            <span className="team-role">{roleLabels[member.role]}</span>
            <TeamMemberMenu
              member={member}
              currentUserId={currentUserId}
              onAction={setAction}
            />
          </li>
        ))}
      </ul>
      {visibleInvitations.length > 0 && (
        <section aria-labelledby="pending-title" className="team-pending">
          <h3 id="pending-title">
            Pending invitations{" "}
            <span className="team-count">{visibleInvitations.length}</span>
          </h3>
          <ul className="team-list">
            {visibleInvitations.map((invitation) => (
              <li
                key={invitation.id}
                className="team-row team-invitation"
                tabIndex={-1}
                ref={
                  invitation.id === invitations.at(-1)?.id
                    ? latestInvitation
                    : undefined
                }
              >
                <span className="team-invite-email">{invitation.email}</span>
                <span className="team-role">{roleLabels[invitation.role]}</span>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label={`Actions for ${invitation.email}`}
                    render={<Button variant="ghost" size="icon-sm" />}
                  >
                    <Ellipsis aria-hidden="true" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" finalFocus={search}>
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() => {
                          onRevoke(invitation.id)
                          setAnnouncement(
                            `Invitation for ${invitation.email} cancelled.`,
                          )
                        }}
                      >
                        Cancel invitation
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ul>
        </section>
      )}
      {!visibleMembers.length && !visibleInvitations.length && (
        <div className="team-empty">
          <p>No matching members or invitations.</p>
          <Button
            variant="ghost"
            onClick={() => {
              setQuery("")
              search.current?.focus()
            }}
          >
            Clear search
          </Button>
        </div>
      )}
      <span className="sr-only" role="status">
        {announcement}
      </span>
      {action && (
        <MemberDialog
          action={action}
          members={members}
          projectCount={
            projects.filter((project) => project.ownerId === action.member.id)
              .length
          }
          onClose={() => setAction(null)}
          onChange={(id, change) => {
            const result = onChange(id, change)

            if (result.ok)
              setAnnouncement(
                change.kind === "role"
                  ? `${action.member.name} is now ${roleLabels[change.role]}.`
                  : `${action.member.name} removed.`,
              )

            return result
          }}
        />
      )}
    </div>
  )
}
