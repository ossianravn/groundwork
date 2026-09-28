# Account preferences and security

Status: Profile, Appearance, Notifications and Security implemented for the demo workspace; additional uploader and provider states remain proposed. Shell: Settings. Primary inventory ownership: SETT-03.

## User goal

Manage personal information, presentation, notifications and account access.

## Routes and composition

| Route | Ordered page composition (in addition to shell) |
| --- | --- |
| `/app/:workspace/settings/profile` | Section heading; name and avatar uploader (SETT-03); personal details; Save/Cancel and dirty feedback (SETT-02). |
| `/app/:workspace/settings/appearance` | Theme mode and named preset selection (SYS-01); density if supported; Restore default; reference theme-playground link for template adopters. |
| `/app/:workspace/settings/notifications` | Labelled notification channel/category groups; Save; result feedback (SYS-04, SETT-02). |
| `/app/:workspace/settings/security` | Example authentication methods; simulated MFA setup/recovery entry (AUTH-04); session fixtures and revoke action; recent sample security activity (TABL-08). |

## Implemented composition and scope

The [shadcn-admin settings layout](https://github.com/satnaing/shadcn-admin/blob/main/src/features/settings/index.tsx) informs a route-based local navigation beside a bounded content column. Narrow layouts move those links above the content. The sidebar member menu provides Profile, Appearance and Notifications; unavailable account actions are absent.

Profile pairs Name with the fictional account email on wide screens, followed by a bounded Bio field. Change photo uses a local file picker, validates that the image can be decoded and offers Remove; no upload, crop service or drag-and-drop is implied. Saving name/photo updates member identity across the shell, project owners and activity. The email is display-only because no credential-management flow exists yet.

Notification preferences have three categories (assignments, mentions, review requests) and two channels (in app, email), with a shared labelled matrix and explicit Save/Cancel. They demonstrate preference state only, with no delivery side effects. Success changes the existing Save action to Saved and announces it without inserting a layout-shifting message.

The account owner retains separate saved values and drafts across route changes. Cancel resets only the active form. Reload and Reset demo data restore the JSON baseline. Appearance reuses the host's existing theme owner and `AppearanceSettings`, applying immediately with device persistence; its page and drawer stay synchronized. Profile/notifications use `src/demo/data/account.json`. Security fixtures live in `src/demo/data/security.json` and share the account owner.

## Security settings and MFA

Security uses the existing bounded settings layout. Two-step verification has an Off/Enabled status and a contextual setup/manage action; recovery codes and disabling are disclosed in dialogs. Sample sessions retain a Revoked state after the action, keeping the opener available. The current browser is identified separately. Recent security events are available through a disclosure.

Setup confirms the visibly supplied demo code `123456`, then reveals six fictional recovery codes. Copy includes a selected-text fallback if the clipboard is unavailable. Codes work once; replacement invalidates the prior set, and disabling removes codes and any pending attempt. Reload/Reset clears changes; a new workspace starts with only the current session and no prior activity.

The user approved applying enabled MFA to password and email-link sign-in, then Google/GitHub local demos (2026-09-27). Try sign-in returns to this page after verification. Open demo remains available because this is a workflow example, not real authorization. Session revocation changes fictional records only. No password change, real TOTP secret/QR code, trusted-device policy or remote session termination is claimed.

## Actions and outcomes

Personal preferences belong to the account even while the shell shows a workspace. Changing appearance previews immediately with a clear saved/reset state. Notification toggles reflect supported channels. Security actions describe the actual method/session affected; unsupported capabilities are absent from the product example and demonstrated in reference fixtures instead.

## States to demonstrate

Loaded; dirty; saving/saved; failed; avatar picker/drag/crop/upload/error; missing avatar; system theme changes; notification delivery unavailable; security action pending/rejected; read-only provider-managed field.

## Responsive and accessible behavior

Use Field groups, Avatar, Input, RadioGroup or Select, Switch/Checkbox, Button and feedback. A color preference is not conveyed by an unlabeled swatch. Avatar upload always offers a file picker and an alternative to cropping when possible.

## Data and persistence

Use users.json for profile/preference examples and scenarios.json for authentication/session outcomes. Profile edits, notification choices and local file previews update demo state. Appearance retains its separate theme preference owner. No account or upload provider is required.

Follows the confirmed [static JSON demo-data contract](../../demo-data.md), including shared state, scenario selection and the proposed baseline-reset behavior.

Inherits [shared shells](../../shells.md), the [quality contract](../../quality.md) and [proposed UX corrections](../../ux-decisions.md). Route authority: [sitemap](../../sitemap.md).
