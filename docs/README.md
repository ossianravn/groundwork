# Demo site specification

Status: implemented core with an evolving backlog. Updated: 2026-09-27.

Build a reusable reference for complete public-site and admin workflows, with an accompanying library for inspecting components, states and themes. Public pages, workspace workflows, settings, local access/onboarding and the reference library are implemented. Individual specifications distinguish delivered behavior from remaining variants. The [sitemap](sitemap.md) summarizes running routes, and the [coverage map](coverage.md) tracks the expanding pattern inventory.

## Start here

The documents below describe the full proposal and its decision owners.

1. Review the [sitemap](sitemap.md) for every proposed route and its page specification.
2. Review [shared shells](shells.md) and the [styling architecture](design-system.md), which apply across pages.
3. Use the [living inventory and coverage map](coverage.md) to find pattern owners, planned demonstrations and implementation dispositions. The 73 original entries are a starting point; expand and refine the inventory as workflows reveal reusable needs.
4. Read [UX decisions and source corrections](ux-decisions.md) before implementing the original recipes.
5. Use the [quality contract](quality.md) as the acceptance baseline and the [source notes](sources.md) to revisit current guidance.
6. Follow the confirmed [static JSON demo-data plan](demo-data.md) for all example data and simulated interactions.
7. Follow the [framework portability proposal](framework-portability.md) to keep reusable React components separate from the demo's routing and application setup.

## Audience and scope

The template adopter needs reusable examples and a fast way to evaluate visual changes. A visitor to the example product needs a coherent public site. A signed-in example user needs to manage work without being exposed to the template's internal documentation. Keep these audiences distinct.

The proposal has three linked surfaces: public website, signed-in application, and reference library. Authentication connects the first two. The reference library has its own navigation and can be omitted from a downstream product.

Confirmed scope: the template uses static JSON files for demo data. “Backend” denotes the admin interface; the template demonstrates authentication, editing, billing, email and webhook flows locally without requiring a database or live application backend. See the [demo-data contract](demo-data.md). Production integration notes describe optional future adaptation, not implementation dependencies for this template.

The illustrative domain is a workspace managing projects. Projects supply consistent records for dashboards, tables, a board, forms, an inbox, and audit history. This is a proposed demonstration vocabulary, not a decision about the products eventually built from the template.

## Why these areas

- Public pages show acquisition, reading, pricing, and contact journeys.
- Application pages show recurring work, inspection, editing, settings, and recovery.
- Reference pages expose pattern variants and reproducible states without cluttering product pages with developer controls.
- One shared theme contract lets an adopter compare all three surfaces using the same tokens.

## Documentation ownership

| Document | Owns | Does not duplicate |
| --- | --- | --- |
| [Original CSV](inventory/shadcn-fullstack-template-spec.csv) | Stable pattern IDs and supplied inventory | Route assignments |
| [Original details](inventory/table-spec-details.md) | Supplied explanation and candidate recipes | Approved product decisions |
| [Sitemap](sitemap.md) | Route existence, navigation placement, shell, specification link | Detailed interaction behavior |
| Page files under pages/ | Per-route composition, outcomes, states, responsive behavior, data responsibilities | Global shell rules |
| [Shells](shells.md) | Shared chrome, navigation and global state surfaces | Page content |
| [Design system](design-system.md) | Styling ownership and theme customization | Domain behavior |
| [Demo data](demo-data.md) | Static JSON datasets, shared loading, local mutations and scenario fixtures | Page markup or a live backend |
| [Framework portability](framework-portability.md) | Reusable React boundaries, host responsibilities and migration expectations | A commitment to one framework or three maintained applications |
| [UX decisions](ux-decisions.md) | Proposed corrections, policy decisions and differences between sources | Silent edits to supplied files |
| [Coverage](coverage.md) | Reverse index from pattern to demonstration | Another copy of the requirements |

Use one Markdown file per independently understandable page. Closely related routes may share a file if it contains a separate composition row for every route: sign-in/sign-up, article listing/detail, create/edit, and similar families. Split a family when its workflows diverge. Do not create 73 nearly empty files merely because there are 73 inventory entries.

Keep the sitemap as the route authority. A page names its routes to explain composition; route changes update both the sitemap and that page in the same change. Coverage changes accompany moved pattern demonstrations. During implementation, derive runtime navigation from the application's route metadata, not by parsing this prose or maintaining an unrelated third route list. A separate machine-readable documentation registry is unnecessary at this planning stage; that is distinct from the confirmed JSON files for demo content and records.

Page specifications follow a small contract: user goal; route-specific component order; actions and outcomes; states; responsive/accessibility details; data and persistence requirements. The coverage table identifies each pattern's primary owner. Repeated use elsewhere does not require another specification.

## Planning decisions and current disposition

| Decision | Recommendation | Consequence |
| --- | --- | --- |
| Example domain | Workspace/project management | Keeps data and terminology consistent across demonstrations |
| Demo host and router | Overview uses React/TypeScript, Vite and TanStack Router; shared views remain independent of routing | Portability is an architectural boundary; a working Next.js/TanStack Start integration has not been verified. See implementation.md for current scope |
| Primitive base and form library | Overview uses shadcn/Base UI primitives and its existing local form validation | Future form-library decisions remain separate from the confirmed static data source; do not reselect the primitive base as an unresolved first-page choice |
| Dependencies | Review exact candidates when implementing their owners | Inventory library names are suggestions, not installation authorization; no live integration providers are needed for the demo |
| Confirmation, quotas and timeout policies | Agree only where an actual operation requires them | No arbitrary CAPTCHA, countdown, row/tag cap or typed confirmation is approved by this draft |
| Browser and assistive-technology support | Establish a supported matrix before implementation | New CSS features must not become hidden prerequisites for essential actions |

## Suggested implementation order

1. Shared tokens, primitives and shells; static JSON datasets and their shared data owner; public home; application overview; theme playground.
2. One complete project journey: list, filter, inspect, create, edit, save, recover from failure. This proves the reusable patterns.
3. Authentication, onboarding, account/workspace settings, public content and pricing pages.
4. Analytics, inbox, board, developer settings and billing examples; complete inventory coverage and reference state demonstrations.

These are sequencing recommendations, not exclusions: all inventory items are mapped. The static JSON demo is the planned implementation. Success and failure scenarios must remain clearly simulated where a real-world side effect would otherwise be implied. No database, authentication service, payment service, mail service or webhook destination is required to explore the template.
