# Workspace and team

Status: core workspace/team subset implemented and ready for review (2026-09-26). Shell: Settings. Primary inventory ownership: SETT-04, SETT-05, EDGE-03. Deletion and the additional scenarios below remain proposed.

## Implemented composition and scope

- `/app/demo/settings/workspace`: bounded name/logo form using the shared image picker and Save/Cancel pattern. Drafts survive navigation; Save updates the shared shell identity; Cancel restores the saved name/logo. No invented slug field or URL availability check.
- `/app/demo/settings/team`: compact member rows with name/email, role and contextual actions. Search matches members and pending invitations. Pending invitations form a separate conditional section; the primary Invite member action opens an email/role dialog. This adapts the inspected shadcn-admin users/invitation pattern, with fewer columns and controls for the small roster.
- Roles are visible without opening menus. Change role opens a focused dialog. The user approved protecting the sole owner from demotion/removal. Make another member an owner before demoting the current sole owner. Roles demonstrate local management state, not production authorization or permission enforcement.
- Removing another member requires an active replacement when they own projects. Reassignment and membership deactivation are atomic. Former members remain in activity history but disappear from assignment controls. The current account's own removal/leave workflow is not included.
- Invitations create local pending records, reject duplicate active-member/pending emails, and can be cancelled. The dialog explicitly says no email is sent. No unusable invite links, pretend mail delivery, acceptance or expiration flow is presented.
- Shared settings navigation uses links on wide layouts and a section menu on phones. Team has a wider content measure than the simple Workspace form. Rows keep roles inline when they fit, stacking secondary information only at narrow container widths. Dialog dismissal restores the row action; removal returns focus to Search team.
- Success is visible in the changed records, with a screen-reader announcement rather than inserted page text. Creating an invitation brings its new row into view after the dialog closes. Reset/reload restore workspace/team fixtures and clear drafts; appearance retains its separate device persistence.

## Later proposed composition

## User goal

Manage workspace identity and access while understanding consequential actions.

## Routes and composition

| Route | Ordered page composition (in addition to shell) |
| --- | --- |
| `/app/:workspace/settings/workspace` | Workspace identity form and avatar (SETT-03); Save/Cancel (SETT-02); clearly separated deletion area with agreed confirmation behavior (EDGE-03). |
| `/app/:workspace/settings/team` | Member table (SETT-04); search/status; role control; invitation Dialog (SETT-05); pending invitation actions; remove-member action. |

## Later proposed actions and outcomes

Role changes and invitations indicate simulated success after the local state update. A role menu shows meaningful role descriptions. Last-owner and denied-access scenarios demonstrate the source's domain rules. Example invite links are copied with confirmation, and expired/revoked scenarios remain distinguishable. Workspace deletion affects resettable demo data; the reference can compare confirmation variants without claiming to perform an irreversible production operation.

## Additional states still proposed

Dirty/saving; slug collision; owner/admin/member/viewer fixtures; pending/expired/revoked invite; invitation send or copy failure; role change failed; member removal failed; attempted last-owner removal; delete confirmation/pending/failed; workspace no longer accessible.

## Responsive and accessible behavior

Table, Select, Dialog/AlertDialog, Input, Badge and Button compose the controls. Roles are readable without opening a menu. Dialog names identify the affected member/workspace. Avoid making routine access management rely on ambiguous icon-only actions.

## Data and persistence

The implementation uses `workspace.json` for identity/people, `team.json` for memberships and invitations, and the existing project/activity fixtures. `use-workspace-identity.ts` owns identity drafts; `use-workspace.ts` owns the shared records; `team.ts` owns membership/reassignment rules. New-workspace setup starts with the current account as sole owner and no invitations. Mutations affect local demo state only and can be restored with Reset demo data. No real invite is sent.

Follows the confirmed [static JSON demo-data contract](../../demo-data.md), including shared state, scenario selection and the proposed baseline-reset behavior.

Inherits [shared shells](../../shells.md), the [quality contract](../../quality.md) and [proposed UX corrections](../../ux-decisions.md). Route authority: [sitemap](../../sitemap.md).
