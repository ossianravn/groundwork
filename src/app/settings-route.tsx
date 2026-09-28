import { Link, useSearch } from "@tanstack/react-router"
import {
  SettingsLayout,
  type SettingsLinkProps,
  type SettingsSection,
} from "@/features/settings/settings-layout"
import { ProfileSettings } from "@/features/settings/profile-settings"
import { NotificationSettings } from "@/features/settings/notification-settings"
import { AppearancePage } from "@/features/settings/appearance-page"
import { WorkspaceSettings } from "@/features/settings/workspace-settings"
import { ApiKeySettings } from "@/features/settings/api-key-settings"
import { WebhookSettings } from "@/features/settings/webhook-settings"
import { TeamSettings } from "@/features/settings/team-settings"
import { BillingSettings } from "@/features/settings/billing-settings"
import { SecuritySettings } from "@/features/settings/security-settings"
import { buttonVariants } from "@/kit/ui/button"
import { useDemoWorkspace } from "./workspace-context"
import { useRouteFocus } from "./use-route-focus"

function SettingsLink({ section, ...props }: SettingsLinkProps) {
  if (section === "webhooks")
    return (
      <Link
        {...props}
        to="/app/demo/settings/webhooks"
        search={{ scenario: "normal" }}
      />
    )

  return <Link {...props} to={`/app/demo/settings/${section}`} />
}

function SettingsRoute({ section }: { section: SettingsSection }) {
  const { demo, appearance } = useDemoWorkspace()
  const { account, identity, integrations } = demo
  const { scenario } = useSearch({ strict: false })

  useRouteFocus()

  const label = {
    profile: "Profile",
    appearance: "Appearance",
    notifications: "Notifications",
    security: "Security",
    workspace: "Workspace",
    team: "Team",
    billing: "Billing",
    "api-keys": "API keys",
    webhooks: "Webhooks",
  }[section]

  return (
    <>
      <title>{label} · Settings · Tandem</title>
      <SettingsLayout section={section} LinkComponent={SettingsLink}>
        {section === "security" && (
          <SecuritySettings
            mfa={{
              enabled: account.security.enabled,
              codes: account.security.recoveryCodes,
              onEnable: account.security.enable,
              onDisable: account.security.disable,
              onReplace: account.security.replaceCodes,
            }}
            sessions={account.security.sessions}
            events={account.security.events}
            onRevoke={account.security.revokeSession}
            signInLink={
              <Link
                to="/auth/sign-in"
                search={{ returnTo: "/app/demo/settings/security", token: "" }}
                className={buttonVariants({ variant: "outline" })}
              >
                Try sign-in
              </Link>
            }
          />
        )}
        {section === "billing" && (
          <BillingSettings
            selection={demo.workspace.subscription}
            invoices={demo.workspace.invoices}
            members={demo.workspace.members.length}
            projects={demo.projects.length}
            onSave={identity.changePlan}
          />
        )}
        {section === "api-keys" && (
          <ApiKeySettings
            keys={integrations.keys}
            onCreate={integrations.createKey}
            onRevoke={integrations.revokeKey}
          />
        )}
        {section === "webhooks" && (
          <WebhookSettings
            webhooks={integrations.webhooks}
            deliveries={integrations.deliveries}
            onSave={integrations.saveWebhook}
            onTest={integrations.testWebhook}
            failFirstTest={scenario === "webhook-failure"}
          />
        )}
        {section === "workspace" && (
          <WorkspaceSettings
            value={identity.draft}
            revision={identity.revision}
            dirty={identity.dirty}
            onChange={identity.setDraft}
            onSave={identity.save}
            onCancel={identity.cancel}
          />
        )}
        {section === "team" && (
          <TeamSettings
            currentUserId={demo.workspace.currentUserId}
            members={demo.memberships
              .filter((item) => item.active)
              .map((membership) => {
                const member = demo.workspace.members.find(
                  (item) => item.id === membership.memberId,
                )

                if (!member)
                  throw new Error("Active membership has no identity")

                return {
                  ...member,
                  email: membership.email,
                  role: membership.role,
                }
              })}
            invitations={demo.invitations}
            projects={demo.projects}
            onInvite={demo.inviteMember}
            onRevoke={demo.revokeInvitation}
            onChange={demo.updateMember}
          />
        )}
        {section === "profile" && (
          <ProfileSettings
            profile={account.profileDraft}
            revision={account.profileRevision}
            email={account.email}
            dirty={account.profileDirty}
            onChange={(changes) =>
              account.setProfileDraft((current) => ({ ...current, ...changes }))
            }
            onSave={account.saveProfile}
            onCancel={account.cancelProfile}
          />
        )}
        {section === "appearance" && <AppearancePage appearance={appearance} />}
        {section === "notifications" && (
          <NotificationSettings
            preferences={account.notificationDraft}
            dirty={account.notificationsDirty}
            onChange={account.setNotificationDraft}
            onSave={account.saveNotifications}
            onCancel={account.cancelNotifications}
          />
        )}
      </SettingsLayout>
    </>
  )
}

export function ProfileRoute() {
  return <SettingsRoute section="profile" />
}

export function AppearanceRoute() {
  return <SettingsRoute section="appearance" />
}

export function NotificationsRoute() {
  return <SettingsRoute section="notifications" />
}

export function WorkspaceSettingsRoute() {
  return <SettingsRoute section="workspace" />
}

export function TeamRoute() {
  return <SettingsRoute section="team" />
}

export function ApiKeysRoute() {
  return <SettingsRoute section="api-keys" />
}

export function WebhooksRoute() {
  return <SettingsRoute section="webhooks" />
}

export function BillingRoute() {
  return <SettingsRoute section="billing" />
}

export function SecurityRoute() {
  return <SettingsRoute section="security" />
}
