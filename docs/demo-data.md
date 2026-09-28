# Static JSON demo data

Access implementation (2026-09-26): root DemoStateProvider owns workspace/profile/project drafts across app and auth routes. `use-access.ts` stores registration identity/workspace draft and one demo reset token in memory; passwords never cross the form boundary. Setup starts an empty workspace with the supplied sample identity. Reset/reload restore fixtures. Sign-in/out are navigable demonstrations, not an app access gate; no emails are sent. See [access scope](pages/auth/access.md#implemented-scope--2026-09-26).

Status: static JSON data source confirmed by the user and implemented for Overview and the Projects list, inspector, detail and create/edit workflow. Broader datasets and scenario demonstrations below remain planned.

The implemented fixtures include `src/demo/data/workspace.json` (identity/people), `team.json` (memberships/invitations), `account.json`, `projects.json` and `activity.json`. `src/demo/use-workspace.ts` owns shared in-memory mutations, `model.ts` owns shapes and date formatting, and `selectors.ts` derives summaries/filter results. Identity drafts are owned by `use-workspace-identity.ts`. Member removal deactivates membership and reassigns projects atomically; retained people identify historical activity and active members supply assignment choices. The workspace fixture owns the fixed reference date. Appearance preferences have a separate owner in `src/theme/`; no runtime action writes fixture files.

Analytics derives all three completion views from the same period/project-scoped activity records in `src/demo/analytics.ts`; it has no separate fixture or stored totals. Contributor attribution uses the activity actor, not the current project owner. Its period, project and project-data view live in the URL.

Developer settings use `integrations.json` with shared `use-integrations.ts` state. Only key metadata is retained; the dummy reveal belongs to its creation dialog. Endpoint edits retain earlier delivery snapshots. `webhook-failure` in `scenarios.json` supplies the named simulated HTTP 500 result. Reset/reload restores fixtures and workspace creation clears keys, endpoints and delivery history. No outbound endpoint request is made.

## Scope

The website template loads its example records, content and scenario data from static JSON files committed with the project. Public pages, the admin interface and reference examples use the same relevant datasets. Running the demo requires no database, live authentication service or application API.

Static JSON describes the data, not whether the UI can be interactive. Search, sorting, filtering, pagination, editing, board moves and simulated saves can all operate in the browser. No runtime action writes back to the repository's JSON files.

## Proposed file organization

Keep a central demo-data directory, divided by domain rather than page. The exact source path follows the eventual framework; these names describe the intended datasets.

| JSON dataset | Contents and consumers |
| --- | --- |
| workspaces.json | Workspace identity and setup state; switcher, onboarding and workspace settings |
| users.json | Fictional profiles, memberships, roles and preferences; owner selectors, team and profile views |
| projects.json | Project records, tags, descriptions and related links; table, grid, board, inspector and editor |
| activity.json | Seeded project/workspace history; activity feed and historical analytics |
| inbox.json | Requests and notifications linked to projects; inbox, drawer and unread counters |
| billing.json | Plans, sample subscriptions, usage and invoices; public pricing and billing settings |
| integrations.json | Nonfunctional key metadata, webhook endpoints and delivery examples; developer settings |
| content.json | Marketing content, sample testimonials, FAQ, articles, releases and help content |
| themes.json | Implemented in `src/features/reference/`: shipped names/accent identifiers only. CSS owns palette values; exports resolve both modes from that owner. |
| scenarios.json | Named loading, empty, failure, permission and authentication fixtures; includes a stable reference date for date-sensitive examples |

Split a domain file when its size or ownership warrants it. Do not duplicate a project, user or price just because it appears on another page. Referenced media and sample downloads remain ordinary asset files; JSON contains their paths and metadata.

## Data access and consistency

Project descriptions use a single Tiptap JSON document in runtime records, editor drafts and newly captured Activity changes. `project-fixtures.ts` converts existing plain-text fixture descriptions; quick-create converts at its mutation boundary. Shared rich-text helpers derive plain previews and render the supported schema. Formatting-only edits are recorded; reload/reset still restores the fixture baseline.

One small shared data owner loads the JSON and exposes the feature operations used by the UI. Components receive records and results through that owner; they do not each import and mutate a separate copy of the same dataset. Feature-specific operations can remain cohesive without a generic database framework or an invented HTTP API.

Use stable IDs and explicit relationships between workspace, user, project and activity records. Define the record shapes in the selected application language and check that fixtures follow them. Dashboard totals and breakdowns derive from the same records where possible; historical series come from activity data. A project edit should update its detail, list, board and relevant summaries coherently.

Theme JSON and CSS must not become two independently maintained sources for the same preset. Resolve or generate the shipped CSS values from the chosen token owner, following the [styling architecture](design-system.md).

## Interaction state

Implemented behavior: load an immutable JSON baseline and keep project creation/editing/completion, team changes, inbox read state and activity events in shared in-memory application state above routing. Navigation retains mutations; a full reload starts from the baseline. Reset demo data restores the related datasets and clears the inspected record. Projects filters/sort/page/inspection and Inbox selection/filter live in the URL; Overview table state remains local, and appearance remains separate. A URL for a reload-lost created record shows an unavailable state with recovery. Routed create/edit drafts are owned by the persistent host: navigation retains them, Cancel discards the current draft, and save/reset/reload clears the appropriate drafts. Project deletion remains a future demonstration.

This reload/reset behavior is the existing demo contract. Retaining record edits across reloads would require an explicit change to that contract. Theme preferences persist independently and are not erased by Reset demo data. Named playground presets use a separate `awesome-web-template.presets.v1` device namespace. The host retains an unsaved playground draft during navigation; reload restores the last saved preset. Preview documents own separate in-memory record sessions and do not persist their appearance changes to the site.

Selected files can be previewed locally for the upload demonstration; nothing is uploaded to a service. A sample invoice download returns an actual sample asset. JSON seeds remain unchanged by these operations.

## Reproducible scenarios

Board movement shares the project/activity mutation owner with bulk changes. Entering Completed finishes remaining tasks; reopening changes status while retaining completed-task counts and historical activity (user-approved 2026-09-26). No-op moves add no event, and completing reopened work counts only tasks still incomplete. The existing `bulkScenario=partial-failure` query also demonstrates a rejected Website redesign move; Retry move uses the normal successful path.

The named `save-failure` fixture in `src/demo/data/scenarios.json` is implemented for routed create/edit. A fresh editor entry with `?scenario=save-failure` rejects its first valid submission without mutating records or activity. Its retained draft consumes the failure so Retry save uses the normal atomic operation; navigation preserves that state, while reload rearms an explicitly selected scenario. This is a synchronous local demonstration, with no artificial delay or API call. Broader scenario controls, refresh cycles, conflicts and authentication/permission failures remain planned. Existing no-match filtering, validation, reset, appearance-storage feedback, lazy-chart fallback and route-error handling retain their own owners.

Use named JSON scenarios for first use, no matches, loading, save failure, partial bulk failure, expired session and denied access. Select them through the reference controls and the common data owner so they exercise the same components as the normal pages. Keep ordinary interactions responsive; introduce delay only when demonstrating a pending state.

Date-based views use the scenario's reference date so fixtures do not become empty or inconsistent as calendar time passes. Prefer repeatable sample data to newly randomized records on every render.

Authentication examples change a local demo-session state. OAuth, magic links, password reset, invitations, payment management and webhook tests show their configured fixture outcome without contacting a provider. Demo role/permission states demonstrate UX; they are not security boundaries. Input fields must not encourage use of real credentials.

## Verification when implemented

Implemented catalog and Billing (2026-09-27): `src/demo/data/billing.json` owns the approved illustrative USD prices, packaging, sample Team monthly subscription and historical invoices. Pricing/sign-up and Billing share the workspace identity's in-memory subscription selection. Billing derives its total from the current active member count; fixed invoice records retain their original member count and unit amount. Plan changes do not create invoices or enforce quotas. Reset/reload restores the fixture; starting a workspace preserves any sign-up selection and clears invoices. `public/invoices/` contains actual, clearly marked sample PDFs. `public-product.json` owns product text and shipped preview metadata.

- JSON parses, IDs are unique within their dataset and references resolve.
- Shared views agree before and after a local mutation; reset restores the baseline coherently.
- Filtering, pagination and date ranges produce predictable results from the fixtures.
- Each selected error/loading scenario can be reproduced and recovered from through its advertised action.
- Exploring the demo needs no API credentials or live integration requests; simulated side effects are identified truthfully.

Adding a real backend to a downstream product would replace the data implementation and introduce that product's authorization and persistence contracts. It is not part of this template plan.

Resource content (2026-09-27): `src/demo/data/content.json` owns authored articles, help guides, FAQs and explicitly sample releases. Stable slugs and section IDs support related links, local search and anchors. No content service or support delivery is involved. The resource specification owns implemented variants.

Contact/legal (2026-09-27): `use-contact.ts` owns the contact draft and local result above routing. Navigation retains the draft; completion, Reset demo data and reload clear it. A fresh draft at `/contact?scenario=contact-failure` fails its first valid submission, retains all input and completes on retry. No message is sent or persisted. `content.json` owns the clearly labelled Privacy/Terms specimens; no consent state or optional tracking integration is introduced.

Inbox (2026-09-27): `inbox.json` seeds incoming project-linked conversations. The `inbox.ts` reducer owns conversations, posts, compose/reply drafts, read flags and read-action failure state; `use-inbox.ts` retains it above routes. New conversations address one active workspace member and optionally a project. Replies append posts atomically, mark the thread read and refresh its list position/preview. Navigation and dialog dismissal retain drafts; Cancel discards, successful send clears its draft, and reset/reload clears all mutations/drafts. A new workspace starts empty. The bell projects incoming posts only and derives its own unread count. `scenario=inbox-failure` preserves records on the first rejected read action and supports retry. No external delivery or simulated teammate response occurs.

### Security settings and verification

`src/demo/data/security.json` contains fictional sessions and initial security events. `useSecurity`, owned by the shared account, keeps enabled MFA, recovery codes, events and the current verification handoff together. Recovery verification consumes the code and challenge atomically. Reload/Reset restores the baseline; registration starts with the current browser only and no earlier events. These records provide no real authorization or remote session control.

### Provider access

`src/demo/data/auth-providers.json` names Google/GitHub and the fictional registration identity. Sign-in reads the current demo account. `use-provider-access.ts`, under the existing access owner, retains only the current local attempt and its captured intent, return destination, plan and identity; consuming it clears it synchronously. Reset/reload clears the attempt. No provider token or password is stored or transmitted. Registration's non-password form draft also survives navigation and clears on completed onboarding, Reset or reload. The unavailable scenario is selected only through the reference URL; retry uses the normal successful path.

### Project tags and related links

Canonical projects and editor drafts include `tags: string[]` and `links: { id, url, label }[]`. Static project fixtures seed both. Fully blank link rows are omitted at save; trimmed web links, tags and Activity changes commit with the primary fields. Row IDs serve editing identity and do not themselves make a semantic edit. Inline-created tags belong to the project draft until Save. The save boundary trims/deduplicates tag names case-insensitively and reuses the spelling found in saved projects; those records also supply suggestions across editors. Cancel/reload therefore cannot leak unsaved names into a separate registry. No new persistence or service is added.
