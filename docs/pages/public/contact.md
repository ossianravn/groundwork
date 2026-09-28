# Contact

Status: core local example implemented, 2026-09-27. Shell: Public. Primary inventory ownership: MKT-14.

## User goal

Try a contact workflow and understand its outcome. This demo never sends a message; delivery requires a later service integration.

## Routes and composition

| Route | Ordered page composition (in addition to shell) |
| --- | --- |
| `/contact` | Page heading; contact form (MKT-14): name, email, subject and message; submit button; delivery result; alternate contact route when one exists. |

## Actions and outcomes

Validate on submission. Display associated field errors and a form-level simulated failure; retain entered values for retry. Local completion explicitly says no message was sent and offers another attempt or the working demo. A future delivery integration must report its actual outcome.

## States to demonstrate

Implemented: idle; editing; invalid; local completion; first-attempt failure and successful retry. Pending delivery and rate limiting are deferred until an actual asynchronous endpoint requires them; there is no fabricated loading delay.

## Responsive and accessible behavior

Use Field/FieldGroup with Input, Select or NativeSelect, Textarea and Button. Textarea can grow but remains usable with long text and on-screen keyboard. Associate instructions/errors with controls.

## Data and persistence

`src/demo/use-contact.ts` owns the in-memory form above routing. Navigation retains it; completion discards entered values; Try another message starts blank and focuses Name. Reset demo data and reload also clear it. Appearance storage remains independent.

Native required/email validation checks Email and Message; Name and Subject are optional. Errors appear on attempted submission and clear as the field is edited. A focused local completion explicitly states that no message was sent.

Open `/contact?scenario=contact-failure` with a fresh draft to reproduce a first valid submission failure. Its message comes from `scenarios.json`; input remains editable and retry completes locally. No input is written to source JSON, browser storage or a delivery service.

## Composition source

The split introduction and bounded form adapt [Shadcnblocks Contact 1](https://www.shadcnblocks.com/block/contact1), using existing Base UI/shadcn Field primitives and local spacing/control rules. Short fields share one row on wide layouts; narrow screens stack in reading order. Help and Privacy are working alternate destinations; no fake email address or support-response promise is supplied.

Follows the confirmed [static JSON demo-data contract](../../demo-data.md), including shared state, scenario selection and the proposed baseline-reset behavior.

Inherits [shared shells](../../shells.md), the [quality contract](../../quality.md) and [proposed UX corrections](../../ux-decisions.md). Route authority: [sitemap](../../sitemap.md).
