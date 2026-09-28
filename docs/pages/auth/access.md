# Sign-in, registration and verification

Status: core sign-in/registration, passwordless access, local MFA and Google/GitHub provider demos implemented. Shell: Auth. Primary inventory ownership: AUTH-01, AUTH-02, AUTH-03, AUTH-04. Real authentication remains outside scope.

## Implemented scope — 2026-09-26

Sign-in and registration adapt the shadcn [login block](https://ui.shadcn.com/blocks/login), retrieved through the project CLI for Base UI/base-nova. Shared fields, password visibility, input groups and buttons use local tokens. The column is bounded at 26rem; narrow screens align it near the top. Native required/email validation, current/new-password autofill and paste are supported.

Any sample email and nonempty password demonstrate entry to the existing workspace. This does not identify or authorize a real user. Visible disclosure states that no account is created, password stored or email sent. Sign out opens this access example without discarding project changes/drafts. Known local return destinations preserve the interrupted page; direct app access remains open.

Registration retains only name/email/workspace draft in memory, then opens the Workspace/Team/Ready onboarding flow. Passwords never reach shared state, storage or URLs. No real password policy or identity provider is invented. Provider and verification examples are described below.

## Passwordless scope — 2026-09-27

`/auth/magic-link` adapts shadcn's project-aware Base UI/base-nova `login-05` email form within the existing access shell. The password page offers this alternative. The email draft survives client navigation; required/email validity and username autofill use native inputs. No email is stored in URLs or local storage.

`/auth/check-email?purpose=sign-in` shows the requested sample address, Open demo sign-in link, Request another link and Use another email. A replacement changes the existing action label to New link ready and announces the result without inserting a banner. The displayed request's address is reused for replacement, even if the form draft changed during Back navigation. The default receipt purpose remains recovery for existing reset links.

`/auth/callback` consumes the matching in-memory sign-in link once and returns to the destination captured when requesting it, preserving existing workspace edits. Missing, replaced, consumed or reload-lost links provide Request a new link. Reload and Reset demo data clear the draft and link. Password-reset state is independent, so one method does not invalidate the other.

These are local link-lifecycle examples: no email, credential check, session authorization, cross-device transfer or arbitrary expiry/cooldown is implemented. The shared visible disclosure states the simulation boundary. Callback processing has no artificial delay. Real network failures remain deferred.

## Provider access scope — 2026-09-27

The user approved Google and GitHub as local examples. Grouped provider buttons precede the email forms, adapting the project-aware Base UI/base-nova `login-03` composition. `/auth/provider/:provider` identifies the simulation and offers one fictional account, Continue and Cancel; it does not imitate a provider's credentials or consent screen. Sign-in uses the current demo account; registration uses Alex Morgan from `auth-providers.json`.

Continue captures the provider, intent, validated destination, optional plan and sample identity in one in-memory attempt. `/auth/provider/callback` consumes the current attempt once. Successful sign-in uses the same MFA handoff as password/email-link entry; registration enters the existing onboarding flow with its selected plan. Callback query changes cannot substitute the captured context. Unknown providers and missing/replaced/used/reload-lost attempts offer an appropriate method-selection page.

Cancel returns to the originating form without a banner. Non-password registration fields survive this navigation and clear on completed onboarding, Reset or reload. `?scenario=provider-unavailable` is a reference-only entry into the unavailable result; Try again uses the normal path and Use another method retains registration intent, plan and destination. No success message displaces content.

No provider connection, OAuth exchange, credential storage, account linking or external data sharing occurs. These demonstrate interaction and recovery only, not a production authorization boundary.

## Two-step verification

`/auth/verify` is connected to password, email-link and provider sign-in when MFA is enabled in Security settings. One shared handoff stores the validated local destination before opening the challenge. A later attempt replaces the prior challenge; verification consumes it once and returns to that stored destination. Query changes cannot substitute a new destination. Missing, already-used or reload-lost attempts offer sign-in again.

The reusable verification form uses the official [shadcn Base UI Input OTP](https://ui.shadcn.com/docs/components/base/input-otp), controlled six-digit entry, numeric keyboard, one-time-code autocomplete, paste normalization and explicit Verify. The fixed code is disclosed as a demo input. Recovery-code entry is an alternate mode; a successful code is consumed atomically with the challenge. Rejected codes retain entry and focus for correction. No lockout, cooldown, delivery timer or real TOTP validation is introduced.

Setup, recovery-code copy/replacement, disabling and sample sessions belong to [Security settings](../settings/account.md). Reload and Reset clear all security state. The direct demo remains open; this is not an authentication boundary. Physical autofill and screen-reader conformance remain unverified.

## User goal

Enter the application using an available method and recover from an interrupted attempt.

## Routes and composition

| Route | Ordered page composition (in addition to shell) |
| --- | --- |
| `/auth/sign-in` | Brand/home link; sign-in heading; identifier/password form; visibility toggle; available provider actions; magic-link and recovery links (AUTH-01, AUTH-02, AUTH-03). |
| `/auth/sign-up` | Account form; selected plan summary when present; available provider actions; terms/privacy links; sign-in link (AUTH-01, AUTH-02). |
| `/auth/magic-link` | Email form; Send sign-in link action; alternate sign-in method (AUTH-03). |
| `/auth/check-email` | Simulated sent-state card; destination hint; change-email action; resend state from selected JSON scenario (AUTH-03). |
| `/auth/verify` | Labelled code input; Verify action; alternative recovery method if supported (AUTH-04). |
| `/auth/callback` | Email-link consumption; successful handoff to intended destination; recoverable unavailable state (AUTH-03). |
| `/auth/provider/:provider` | Disclosed local provider continuation; sample account; Continue and Cancel (AUTH-02). |
| `/auth/provider/callback` | Single-use local handoff; enabled MFA or onboarding; unavailable and retry states (AUTH-02). |

## Actions and outcomes

Form uses Field, Input, Button, Card and clear error text. Simulated provider attempts cannot conflict with another pending method. Password managers, OTP autofill and paste remain usable. Default OTP uses explicit Verify. The demo-session owner returns to a known local destination after success. No real credentials or tokens belong in fixtures or persisted demo state.

## States to demonstrate

Idle; submitting; invalid input; rejected credentials/code; provider cancelled/unavailable; link sent; retry allowed/unavailable; invalid/expired/used token; account already in expected state; callback failure.

## Responsive and accessible behavior

Focused single-column form is the baseline; optional split branding disappears without removing needed content. Do not autofocus in a way that unexpectedly opens a mobile keyboard. Meaningful errors do not depend on animation.

## Data and persistence

Use fictional users from users.json and named outcomes from scenarios.json. Sign-in, OAuth, magic links and verification change a local demo-session state; no provider or real credential verification is involved. After simulated success, existing members return to work and new-workspace examples enter onboarding. Use clearly identified demo inputs.

Follows the confirmed [static JSON demo-data contract](../../demo-data.md), including shared state, scenario selection and the proposed baseline-reset behavior.

Inherits [shared shells](../../shells.md), the [quality contract](../../quality.md) and [proposed UX corrections](../../ux-decisions.md). Route authority: [sitemap](../../sitemap.md).
