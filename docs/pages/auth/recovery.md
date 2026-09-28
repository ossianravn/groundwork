# Account recovery

Status: local core recovery implemented; provider/network outcomes remain proposed. Shell: Auth. Primary inventory ownership: AUTH-07.

## Implemented scope — 2026-09-26

Forgot password accepts a valid email and opens a generic receipt. No email is sent; Open demo reset link exposes the next step. The shared check-email route defaults to recovery; explicit sign-in receipts use a separate request owner and cannot consume reset links. A new request replaces the previous token. Reset accepts a sample new password without storing it, consumes the in-memory token once and offers sign-in with the original known local return destination. No real credential change or automatic sign-in is claimed.

Missing, replaced, consumed or reload-lost links offer a new request. No arbitrary expiry timer or password-strength policy is added. Native form validity and local link lifecycle are real; transport, provider errors and asynchronous submitting states below remain proposed. Workspace edits/drafts survive recovery because their owner lives above both shells.

## User goal

Regain access without losing the context of the interrupted task.

## Routes and composition

| Route | Ordered page composition (in addition to shell) |
| --- | --- |
| `/auth/forgot-password` | Email field; request-reset action; generic receipt state; return to sign-in (AUTH-07). |
| `/auth/reset-password` | New-password fields and visibility controls; requirements from actual policy; Reset password action; completed/expired states (AUTH-07). |

## Actions and outcomes

The request result avoids confirming whether an account exists. Invalid or expired links offer a new request. Successful reset presents the actual next step rather than pretending a session exists. Preserve the safe intended destination through reauthentication.

## States to demonstrate

Requesting; generic sent; unavailable service; invalid/expired/used token; password rejected by selected policy; submitting; reset complete.

## Responsive and accessible behavior

Support autocomplete and paste; associate policy/errors with fields. Keep confirmation and failure headings announced without erasing useful context.

## Data and persistence

Use scenarios.json for request, expired-link and reset outcomes. Recovery changes only the local demonstration state; it does not send mail or reset a real password. Production token and password policy is outside template scope.

Follows the confirmed [static JSON demo-data contract](../../demo-data.md), including shared state, scenario selection and the proposed baseline-reset behavior.

Inherits [shared shells](../../shells.md), the [quality contract](../../quality.md) and [proposed UX corrections](../../ux-decisions.md). Route authority: [sitemap](../../sitemap.md).
