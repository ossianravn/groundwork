# Workspace onboarding

Status: workspace, optional team and completion steps implemented; awaiting review. Shell: Auth. Primary inventory ownership: AUTH-05, AUTH-06.

## Implemented scope — 2026-09-27

After registration, Workspace asks for a name; Team offers one invitation row with additional rows on demand. Back retains name/email/workspace and invitation drafts, including roles; passwords must be re-entered when returning to registration. Continue leaves the existing demo workspace intact until the final step.

Create invitations validates the entire batch before creating the new workspace and its pending invitations together. Blank rows are ignored; the creator's email and repeated emails use the existing Team invitation rules. Skip for now creates no invitations, even when draft rows contain input. Completion summarizes the workspace, owner, selected sample plan (when present) and pending invitations, with Open workspace and Manage team actions.

`/onboarding` resumes the recorded step. Direct/reloaded setup entry without registration offers Create an account. Revisiting an earlier step after completion returns to the summary without reinitializing workspace data. Reset demo data and reload clear setup and restore Studio North. Slug availability, avatar upload, server-backed resume, real invitation delivery and a guided tour remain deferred.

## Getting started — 2026-09-29

After setup completes, Overview leads with a Get started list (AUTH-09) until the person hides it (session memory; reset clears it). Four steps read the workspace records rather than stored ticks: a project exists, a task exists, an invitation or second active member exists, and a comment exists. Each open step links to where it happens (New project, the first project's tasks, Team, the first project's comment field); done steps are struck through and announced as done. A progress bar counts them, and the heading changes once all are done. Hiding moves focus to the page. Importing the sample CSV satisfies the first step; its owners are unknown in a new workspace, so those rows import with the importer as owner and say so.

## User goal

Create a usable workspace with minimal required setup and reach useful work.

## Routes and composition

| Route | Ordered page composition (in addition to shell) |
| --- | --- |
| `/onboarding/workspace` | Labelled step progress; workspace name; selected sample plan when present; Continue (AUTH-05, AUTH-06). |
| `/onboarding/team` | Step progress; email/role rows with add/remove; Create invitations or Skip for now (AUTH-05, SETT-05, SETT-12). |
| `/onboarding/complete` | Workspace summary; setup result; Open workspace action (AUTH-05). |

## Actions and outcomes

Back navigation retains input. Invitation roles reuse Admin, Member and Viewer from Team settings. Native email validation and associated duplicate/member errors keep the person in the form. Creating the workspace resets prior projects/activity, project drafts and related demo settings through the existing shared owner. The new workspace starts with its creator as owner and no projects; invitations are pending local records, not deliveries.

## States to demonstrate

Implemented: new/resumed setup, invalid email, duplicate/member email, optional blank rows, created workspace, skipped invitations and lost session. Deferred: availability and asynchronous delivery/partial-failure states, which need a separate simulated or real service contract.

## Responsive and accessible behavior

Progress is an ordered, named step sequence with its current step exposed. Focus reaches each new step heading. Email and role share a compact desktop row; narrow rows put email above the role and remove action. Add/remove preserves useful focus. Errors are associated with their email input, and the first invalid batch row receives focus. Geometry uses the existing density and spacing tokens.

## Data and persistence

Registration and invitation drafts belong to `useAccess`; workspace creation and invitations commit through `useWorkspace.startWorkspace`. They remain in memory across client-side navigation. No password is stored and no invitation is delivered. Appearance preferences retain their independent local persistence.

Follows the confirmed [static JSON demo-data contract](../../demo-data.md), including shared state and baseline reset.

Inherits [shared shells](../../shells.md), the [quality contract](../../quality.md) and [proposed UX corrections](../../ux-decisions.md). Route authority: [sitemap](../../sitemap.md).
