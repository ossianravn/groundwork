import type { ReactNode } from "react"
import { roleLabels, type Invitation } from "@/demo/team"

export function SetupComplete({
  name,
  owner,
  plan,
  invitations,
  openLink,
  teamLink,
}: {
  name: string
  owner: string
  plan: string
  invitations: Invitation[]
  openLink: ReactNode
  teamLink: ReactNode
}) {
  return (
    <div className="setup-complete">
      <dl className="setup-summary">
        <div>
          <dt>Workspace</dt>
          <dd>{name}</dd>
        </div>
        <div>
          <dt>Owner</dt>
          <dd>{owner}</dd>
        </div>
        {plan && (
          <div>
            <dt>Plan</dt>
            <dd>{plan}</dd>
          </div>
        )}
        <div>
          <dt>Invitations</dt>
          <dd>
            {invitations.length ? `${invitations.length} pending` : "None yet"}
          </dd>
        </div>
      </dl>
      {invitations.length > 0 && (
        <details className="setup-invitation-details">
          <summary>View invitations</summary>
          <ul>
            {invitations.map((invitation) => (
              <li key={invitation.id}>
                <span>{invitation.email}</span>
                <span>{roleLabels[invitation.role]}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
      <div className="setup-complete-actions">
        {openLink}
        {teamLink}
      </div>
    </div>
  )
}
