import { Ellipsis } from "lucide-react"
import { Badge } from "@/kit/ui/badge"
import { Button } from "@/kit/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/kit/ui/dropdown-menu"
import type { SecuritySession, SecurityEvent } from "@/demo/security"
import { MfaSettings } from "./mfa-settings"
import type { ComponentProps, ReactNode } from "react"

export function SecuritySettings({
  mfa,
  sessions,
  events,
  onRevoke,
  signInLink,
}: {
  mfa: ComponentProps<typeof MfaSettings>
  sessions: SecuritySession[]
  events: SecurityEvent[]
  onRevoke: (id: string) => void
  signInLink: ReactNode
}) {
  return (
    <div className="security-settings">
      <header className="settings-section-heading">
        <h2 id="settings-title">Security</h2>
        <p>Sample account security. Changes reset on reload.</p>
      </header>
      <section aria-label="Sign-in methods" className="security-section">
        <MfaSettings {...mfa} />
        <div className="security-method">
          <h3>Sign-in options</h3>
          {signInLink}
        </div>
      </section>
      <section aria-labelledby="security-sessions" className="security-section">
        <h3 id="security-sessions" className="font-medium">
          Demo sessions
        </h3>
        <ul className="integration-list">
          {sessions.map((session) => (
            <li key={session.id} className="integration-row">
              <div className="integration-record">
                <div className="integration-record-heading">
                  <h4>{session.device}</h4>
                  {session.current && (
                    <Badge variant="secondary">This device</Badge>
                  )}
                  {session.revoked && <Badge variant="outline">Revoked</Badge>}
                </div>
                <p>Last active: {session.lastActive}</p>
              </div>
              {!session.current && (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button variant="ghost" size="icon-sm" />}
                    aria-label={`Session options for ${session.device}`}
                  >
                    <Ellipsis />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        disabled={session.revoked}
                        onClick={() => onRevoke(session.id)}
                      >
                        Revoke session
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </li>
          ))}
        </ul>
      </section>
      <details className="security-activity">
        <summary>Security activity</summary>
        <ul className="integration-list">
          {events.map((event) => (
            <li key={event.id}>
              <span>{event.label}</span>
              <time dateTime={event.at}>
                {new Date(event.at).toLocaleString("en-GB", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </li>
          ))}
        </ul>
        {!events.length && (
          <p className="settings-note">No security activity yet.</p>
        )}
      </details>
    </div>
  )
}
