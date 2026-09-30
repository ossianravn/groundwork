# API keys and webhooks

Status: core local workflows implemented, 2026-09-27. Advanced state variants below remain proposed. Shell: Settings. Primary inventory ownership: SETT-06, SETT-07.

## User goal

Configure an integration and diagnose its status without leaking credentials.

## Routes and composition

| Route | Ordered page composition (in addition to shell) |
| --- | --- |
| `/app/:workspace/settings/api-keys` | Key list with name, masked identifier, scope and usage date; Create key Dialog; one-time secret result; revoke action (SETT-06). |
| `/app/:workspace/settings/webhooks` | Endpoint list; create/edit form; event selection; status; Send test action; expandable delivery log with response detail (SETT-07). |

## Actions and outcomes

A simulated key-creation result shows a clearly nonfunctional value once with a reliable copy action, demonstrating how a real one-time reveal would work. Creation results are distinguished from a failed copy. Key revocation updates the retained row; webhook tests add a simulated response to the endpoint history. These synchronous local actions add no artificial pending delay. Sample logs explain delivery status without containing real credentials or private payloads.

## Implemented delivery

The pages reuse the accepted Settings/Team composition with bounded surfaces, compact rows, the installed shadcn/Base UI Dialog, Field, Select, Checkbox, Badge and Dropdown Menu. Create/edit actions use dialogs; secondary actions use dot menus. Delivery and response disclosures keep technical details out of the default list. Jev supported inline history over an additional Sheet. No dependencies added.

- API keys: create with a name and sample project access; reveal a clearly nonfunctional value once; copy success is distinct from clipboard failure. A blocked copy keeps the value selected for manual copying. Only masked metadata remains in the shared owner after closing. Revoke changes the visible status and disables repeat revocation. Under the keys, Make a request shows the list-projects call as a kit Snippet (DEV-02, 2026-09-30); the address is illustrative and matches the assistant's API answer.
- Webhooks: create/edit named HTTP(S) endpoints, select existing project event types, and inspect simulated deliveries. Tests use the first selected event. Each attempt snapshots its URL/event/time/status/response, so later edits do not rewrite earlier history. No request is sent and no endpoint health is inferred from the sample result.
- `/app/demo/settings/webhooks?scenario=webhook-failure` rejects the first simulated test after entering the page, using `scenarios.json`; Retry test records a successful new attempt while retaining the failure. Reopening the scenario page rearms it.
- Shared state survives navigation. Reset/reload restores `integrations.json`; workspace creation starts with no integration records. Both lists have empty states. Field errors keep values and focus the first invalid field; closing dialogs restores their opener.

Native clipboard writes follow [MDN Clipboard.writeText](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText). Overlay composition uses the [Base UI shadcn Dialog](https://ui.shadcn.com/docs/components/base/dialog) and local primitives. These examples do not supply production credential storage, authorization, signing or endpoint delivery.

## Deferred state variants

Expiry and permissions, asynchronous creation/revocation/saving, queued/sending tests, unavailable logs and webhook signing remain reference variants for later delivery. Empty lists/logs, creation/copy failure/revocation, invalid endpoints and simulated test success/failure are implemented.

## Responsive and accessible behavior

Table, Dialog, Input, Select, Checkbox, Badge, Button and readable code output compose the view. JSON is supplementary to a concise status. Dialog focus works even with long secrets/payloads; horizontal scrolling stays within code.

## Data and persistence

Read integrations.json for unmistakably nonfunctional key examples, endpoints and delivery logs. Create/revoke/test actions update local state or select a configured outcome from scenarios.json. Copy operates on dummy values only; Send test performs no outbound endpoint request.

Follows the confirmed [static JSON demo-data contract](../../demo-data.md), including shared state, scenario selection and the implemented baseline-reset behavior.

Inherits [shared shells](../../shells.md), the [quality contract](../../quality.md) and [proposed UX corrections](../../ux-decisions.md). Route authority: [sitemap](../../sitemap.md).
