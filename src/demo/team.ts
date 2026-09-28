import data from "./data/team.json"
import type { Project } from "./model"

export const teamRoles = ["owner", "admin", "member", "viewer"] as const

export type TeamRole = (typeof teamRoles)[number]

export const roleLabels: Record<TeamRole, string> = {
  owner: "Owner",
  admin: "Admin",
  member: "Member",
  viewer: "Viewer",
}

export type Membership = {
  memberId: string
  email: string
  role: TeamRole
  active: boolean
}

export type Invitation = { id: string; email: string; role: TeamRole }

export type MemberChange =
  { kind: "role"; role: TeamRole } | { kind: "remove"; replacementId: string }

export type TeamRecords = { memberships: Membership[]; projects: Project[] }

export type TeamResult = { ok: true } | { ok: false; message: string }

type MemberChangeResult = { result: TeamResult; records: TeamRecords }

function parseRole(value: string): TeamRole {
  const role = teamRoles.find((item) => item === value)

  if (!role) throw new Error(`Unknown team role: ${value}`)

  return role
}

export const initialMemberships = data.memberships.map((member) => ({
  ...member,
  role: parseRole(member.role),
}))

export const initialInvitations = data.invitations.map((invitation) => ({
  ...invitation,
  role: parseRole(invitation.role),
}))

export function invitationError(
  email: string,
  memberships: Membership[],
  invitations: Invitation[],
): string | null {
  const normalized = email.trim().toLowerCase()

  if (
    memberships.some(
      (item) => item.active && item.email.toLowerCase() === normalized,
    )
  )
    return "This person is already a workspace member."

  if (invitations.some((item) => item.email.toLowerCase() === normalized))
    return "An invitation is already pending for this email."

  return null
}

export function changeMember(
  records: TeamRecords,
  memberId: string,
  change: MemberChange,
): MemberChangeResult {
  const reject = (message: string) => ({
    result: { ok: false as const, message },
    records,
  })

  const member = records.memberships.find(
    (item) => item.memberId === memberId && item.active,
  )

  if (!member) return reject("This person is no longer a workspace member.")

  const owners = records.memberships.filter(
    (item) => item.active && item.role === "owner",
  )

  if (
    member.role === "owner" &&
    owners.length === 1 &&
    (change.kind === "remove" || change.role !== "owner")
  )
    return reject("Make another member an owner first.")

  const ownsProjects = records.projects.some(
    (project) => project.ownerId === memberId,
  )

  if (
    change.kind === "remove" &&
    ownsProjects &&
    !records.memberships.some(
      (item) =>
        item.active &&
        item.memberId !== memberId &&
        item.memberId === change.replacementId,
    )
  )
    return reject("Choose a new owner for their projects.")

  return {
    result: { ok: true },
    records: {
      memberships: records.memberships.map((item) =>
        item.memberId !== memberId
          ? item
          : change.kind === "role"
            ? { ...item, role: change.role }
            : { ...item, active: false },
      ),
      projects:
        change.kind === "remove"
          ? records.projects.map((project) =>
              project.ownerId === memberId
                ? { ...project, ownerId: change.replacementId }
                : project,
            )
          : records.projects,
    },
  }
}
