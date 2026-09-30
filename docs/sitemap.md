# Demo sitemap

Status: living implementation map and backlog. Updated: 2026-09-29. Parameterized routes represent page templates, not individual records.

Implemented areas:

- Public home, Product, Pricing, Customers, Integrations, About, Roadmap, Status, articles, changelog, Help, Contact and legal examples, with shared navigation and a grouped footer.
- Workspace Overview, Projects (Table/Cards/Board, details/create/edit), Inbox, Assistant, Analytics and Activity. Shared project mutations reach related views. Activity has filters, grouped history and event details; sidebar Help provides contextual guides and keyboard shortcuts.
- Settings Profile, Appearance, Notifications, Security, Workspace, Team, Billing, API keys and Webhooks. `/app/demo/settings` redirects to Profile.
- Local password, email-link, Google/GitHub and MFA access demonstrations, recovery and three-step workspace onboarding. `/onboarding` resumes the current local step.
- Reference home, twelve live component examples, all 76 pattern detail entries (67 demonstrated and 9 planned), theme playground and thirteen state scenarios. Catalogue coverage describes examples, not production service readiness.

Linked page specifications own exact behavior and deferred variants. The generic `/app` entry and multi-workspace switching remain proposed; the running fixture workspace is `/app/demo`. Backend authentication, email delivery, payments and external integrations are outside the current local-demo scope.

The demo has three primary areas: public site, application and reference library. Authentication/onboarding is the bridge. This is an experience map, not an XML SEO sitemap; only suitable public content would be indexed.

Confirmed implementation scope: all demo data comes from [static JSON files](demo-data.md). Session, permission and integration outcomes in these routes are local simulations. The sitemap requires no database or live application backend.

## Navigation model

| Area | Primary navigation | Contextual or secondary destinations |
| --- | --- | --- |
| Public | Product, Pricing, Customers, Resources; Sign in and Open demo | Articles, Changelog, Roadmap, Help, Status; footer groups Product, Resources, Company (About, Careers, Contact) and Template; Privacy, Terms |
| Application | Overview, Projects, Inbox, Assistant, Analytics | Activity, Settings, Help; workspace and account controls |
| Settings | Profile, Appearance, Notifications, Security; Workspace, Team, Billing; API keys, Webhooks | Group account/workspace/developer settings; hide unavailable actions according to actual capabilities |
| Reference | Components, Patterns, Themes, States | Public/app examples, source details and accessibility guidance |

A template-level entry links these areas, but reference controls do not clutter the example product's primary navigation. Open demo enters the clearly identified fixture workspace at `/app/demo/overview` without requiring creation of a real account. Auth screens remain reachable demonstrations of the eventual account flow. The fixture entry is a demo-only capability; an eventual real application must not treat the word `demo` in a URL as authorization or an authentication bypass.

## Route tables

Every route inherits the components and states of its named [shell](shells.md), plus the composition in its linked page specification. The ID column lists local examples, not repeated shell components. Full component order and interaction details live in the page file.

### Public website

| Route | Shell | Page-specific patterns | Page specification |
| --- | --- | --- | --- |
| `/` | Public | MKT-02, MKT-03, MKT-04, MKT-06, MKT-09, MKT-10 | [Public home](pages/public/home.md) |
| `/product` | Public | MKT-04, MKT-05, MKT-24, MKT-09 | [Product overview](pages/public/product.md) |
| `/pricing` | Public | MKT-07, MKT-08, MKT-09 | [Pricing and comparison](pages/public/pricing.md) |
| `/customers` | Public | MKT-19, MKT-03, MKT-06 | [Public home](pages/public/home.md#customers--2026-09-29) |
| `/customers/:slug` | Public | MKT-19 | [Public home](pages/public/home.md#customers--2026-09-29) |
| `/integrations` | Public | MKT-18 | [Company pages](pages/public/company.md) |
| `/about` | Public | MKT-20 | [Company pages](pages/public/company.md) |
| `/roadmap` | Public | MKT-21 | [Company pages](pages/public/company.md) |
| `/status` | Public | MKT-22 | [Company pages](pages/public/company.md) |
| `/blog` | Public | MKT-13 | [Articles, changelog and help](pages/public/resources.md) |
| `/blog/:slug` | Public | MKT-13 | [Articles, changelog and help](pages/public/resources.md) |
| `/changelog` | Public | MKT-15 | [Articles, changelog and help](pages/public/resources.md) |
| `/changelog/:version` | Public | MKT-15, MKT-13 | [Articles, changelog and help](pages/public/resources.md) |
| `/help` | Public | MKT-09 | [Articles, changelog and help](pages/public/resources.md) |
| `/help/:slug` | Public | MKT-13, MKT-09 | [Articles, changelog and help](pages/public/resources.md) |
| `/contact` | Public | MKT-14 | [Contact](pages/public/contact.md) |
| `/privacy` | Public | MKT-13, MKT-12 | [Privacy, terms and consent example](pages/public/legal.md) |
| `/terms` | Public | MKT-13 | [Privacy, terms and consent example](pages/public/legal.md) |

### Authentication and onboarding

| Route | Shell | Page-specific patterns | Page specification |
| --- | --- | --- | --- |
| `/auth/sign-in` | Auth | AUTH-01, AUTH-02, AUTH-03 | [Sign-in, registration and verification](pages/auth/access.md) |
| `/auth/sign-up` | Auth | AUTH-01, AUTH-02 | [Sign-in, registration and verification](pages/auth/access.md) |
| `/auth/magic-link` | Auth | AUTH-03 | [Sign-in, registration and verification](pages/auth/access.md) |
| `/auth/check-email` | Auth | AUTH-03 | [Sign-in, registration and verification](pages/auth/access.md) |
| `/auth/verify` | Auth | AUTH-04 | [Sign-in, registration and verification](pages/auth/access.md) |
| `/auth/callback` | Auth | AUTH-03 | [Sign-in, registration and verification](pages/auth/access.md) |
| `/auth/provider/:provider` and `/auth/provider/callback` | Auth | AUTH-02 | [Sign-in, registration and verification](pages/auth/access.md) |
| `/auth/forgot-password` | Auth | AUTH-07 | [Account recovery](pages/auth/recovery.md) |
| `/auth/reset-password` | Auth | AUTH-07 | [Account recovery](pages/auth/recovery.md) |
| `/onboarding/workspace` | Auth | AUTH-05, AUTH-06, SETT-03 | [Workspace onboarding](pages/auth/onboarding.md) |
| `/onboarding/team` | Auth | AUTH-05, SETT-05, SETT-12 | [Workspace onboarding](pages/auth/onboarding.md) |
| `/onboarding/complete` | Auth | AUTH-05 | [Workspace onboarding](pages/auth/onboarding.md) |

### Application

| Route | Shell | Page-specific patterns | Page specification |
| --- | --- | --- | --- |
| `/app/:workspace/overview` | App | DVIZ-05, DVIZ-01, DVIZ-02, TABL-08 | [Overview and analytics](pages/app/overview.md) |
| `/app/:workspace/analytics` | App | DVIZ-05, DVIZ-02, DVIZ-03, DVIZ-04 | [Overview and analytics](pages/app/overview.md) |
| `/app/:workspace/projects` | App | TABL-02, TABL-10, TABL-03, TABL-11, TABL-01, TABL-09, TABL-05, TABL-04, TABL-06 | [Projects data view](pages/app/projects.md) |
| `/app/:workspace/projects/new` | App | SETT-11, SETT-10, SETT-03, SETT-12, SETT-02 | [Project detail, creation and editing](pages/app/project-editor.md) |
| `/app/:workspace/projects/:projectId` | App | EDGE-04, TABL-08 | [Project detail, creation and editing](pages/app/project-editor.md) |
| `/app/:workspace/projects/:projectId/edit` | App | SETT-02 | [Project detail, creation and editing](pages/app/project-editor.md) |
| `/app/:workspace/inbox` | App | TABL-07, SYS-04 | [Inbox and master-detail review](pages/app/inbox.md) |
| `/app/:workspace/assistant` | App | AI-01–AI-14, DEV-01 | [Assistant](pages/app/assistant.md) |
| `/app/:workspace/activity` | App | TABL-08 | [Workspace activity](pages/app/activity.md) |

### Settings

| Route | Shell | Page-specific patterns | Page specification |
| --- | --- | --- | --- |
| `/app/:workspace/settings/profile` | Settings | SETT-03, SETT-02 | [Account preferences and security](pages/settings/account.md) |
| `/app/:workspace/settings/appearance` | Settings | SYS-01 | [Account preferences and security](pages/settings/account.md) |
| `/app/:workspace/settings/notifications` | Settings | SYS-04, SETT-02 | [Account preferences and security](pages/settings/account.md) |
| `/app/:workspace/settings/security` | Settings | AUTH-04, TABL-08 | [Account preferences and security](pages/settings/account.md) |
| `/app/:workspace/settings/workspace` | Settings | SETT-03, SETT-02, EDGE-03 | [Workspace and team](pages/settings/workspace.md) |
| `/app/:workspace/settings/team` | Settings | SETT-04, SETT-05 | [Workspace and team](pages/settings/workspace.md) |
| `/app/:workspace/settings/billing` | Settings | SETT-08, SETT-09 | [Billing and invoices](pages/settings/billing.md) |
| `/app/:workspace/settings/api-keys` | Settings | SETT-06 | [API keys and webhooks](pages/settings/developers.md) |
| `/app/:workspace/settings/webhooks` | Settings | SETT-07 | [API keys and webhooks](pages/settings/developers.md) |

### Reference library

| Route | Shell | Page-specific patterns | Page specification |
| --- | --- | --- | --- |
| `/reference` | Reference | Reference composition | [Reference home and primitive catalogue](pages/reference/library.md) |
| `/reference/components` | Reference | Reference composition | [Reference home and primitive catalogue](pages/reference/library.md) |
| `/reference/components/:component` | Reference | Reference composition | [Reference home and primitive catalogue](pages/reference/library.md) |
| `/reference/patterns` | Reference | Reference composition | [Pattern library](pages/reference/patterns.md) |
| `/reference/patterns/:patternId` | Reference | Reference composition | [Pattern library](pages/reference/patterns.md) |
| `/reference/themes` | Reference | SYS-01 | [Theme playground](pages/reference/themes.md) |
| `/reference/states/:scenario` | Reference | EDGE-01–EDGE-09, AUTH-08 | [Failure and edge-state gallery](pages/reference/states.md) |

## Entry routes and runtime boundaries

| Route / boundary | Result | Owning specification |
| --- | --- | --- |
| `/app` | Resolve session and last accessible workspace, then open its Overview; otherwise sign-in or workspace onboarding as appropriate | [Shells](shells.md), [Access](pages/auth/access.md), [Onboarding](pages/auth/onboarding.md) |
| `/app/:workspace` | Redirect to `/app/:workspace/overview` after scope resolution | [Overview](pages/app/overview.md) |
| `/app/:workspace/settings` | Redirect to Profile; unavailable workspace receives the appropriate access recovery | [Account](pages/settings/account.md) |
| `/onboarding` | Resume the next applicable step, starting with workspace creation for a new account | [Onboarding](pages/auth/onboarding.md) |
| `/reference/states` | Open the state gallery at `loading` | [States](pages/reference/states.md) |
| Unmatched route | Relevant not-found boundary with a useful return destination | [States](pages/reference/states.md), [Shells](shells.md) |
| Forbidden / server failure / expired session | Render at the affected route; do not navigate everyone to a generic standalone error URL | [States](pages/reference/states.md), [Shells](shells.md) |

Redirects are navigation behavior, not blank demo pages. Callback/token handling is part of the authentication route contract. Parameter values are checked by the route/data owner; invented IDs are not assumed to exist.

## Route versus state rules

- Projects uses URL query state for search, filters, sort, pagination, view and inspection. Table/grid/board are views of the same records, not three independent navigation sections.
- Record creation and full editing use dedicated routes. A quick inspector is a contextual Sheet with a link to full detail; Back/close restores the list state.
- Invitations, confirmations, column menus, command search and notification drawers are overlays/actions owned by a page or shell. They do not each need a sitemap route.
- An article slug, project ID or pattern ID is a parameterized destination. The relevant page template defines missing-data behavior.
- Workspace identity appears in the application URL, making links and data scope explicit. Personal settings are still account-scoped; the surrounding workspace path does not change who owns them.
- Error/loading/offline/session states are reproducible in reference fixtures and also handled in real workflows. A gallery entry is not a substitute for that real handling.

## Example complete journeys

1. Home → Product → Open demo → Overview → Projects → Inspect → Edit → Save → unchanged filtered list context.
2. Pricing → selected plan → Sign up → verify as required → Workspace setup → optional invitations → Overview.
3. Projects → filter → select visible records → review action scope → bulk action → confirmed and failed outcomes with recovery.
4. Reference Patterns → inventory ID → real page example → Themes → compare public/app/form/overlay → export saved preset.

These journeys guide validation. They do not require every adopter to retain the fictional project domain or every optional feature.
