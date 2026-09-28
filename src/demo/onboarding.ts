import type { PlanSelection } from "./billing"
import { invitationError, type Invitation, type TeamRole } from "./team"

export interface Registration {
  name: string
  email: string
  workspace: string
  selection?: PlanSelection
}

export type InvitationDraft = { id: string; email: string; role: TeamRole }

export type InvitationErrors = Record<string, string>

export interface OnboardingState {
  registration: Registration | null
  step: "workspace" | "team" | "complete"
  invitations: InvitationDraft[]
}

export const initialOnboarding: OnboardingState = {
  registration: null,
  step: "workspace",
  invitations: [],
}

export function newInvitationDraft(): InvitationDraft {
  return { id: crypto.randomUUID(), email: "", role: "member" }
}

export function registerForSetup(
  state: OnboardingState,
  registration: Registration,
): OnboardingState {
  return {
    registration,
    step: "workspace",
    invitations:
      state.registration && state.step !== "complete"
        ? state.invitations
        : [newInvitationDraft()],
  }
}

// Build the entire batch before committing the new workspace. Blank rows are optional.
export function prepareSetupInvitations(
  rows: InvitationDraft[],
  accountEmail: string,
):
  | { ok: true; invitations: Invitation[] }
  | { ok: false; errors: InvitationErrors } {
  const invitations: Invitation[] = []
  const errors: InvitationErrors = {}

  const creator = {
    memberId: "creator",
    email: accountEmail,
    role: "owner" as const,
    active: true,
  }

  for (const row of rows) {
    const email = row.email.trim().toLowerCase()

    if (!email) continue
    const error = invitationError(email, [creator], invitations)

    if (error) errors[row.id] = error
    else invitations.push({ id: row.id, email, role: row.role })
  }

  return Object.keys(errors).length
    ? { ok: false, errors }
    : { ok: true, invitations }
}
