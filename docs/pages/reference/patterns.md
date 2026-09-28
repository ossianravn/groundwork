# Pattern library

Status: implemented, awaiting review (2026-09-27). Shell: Reference. Exposes all 75 living inventory IDs; it does not implement the planned NAV-07 mobile-navigation variant.

## User goal

Choose a reusable composition and understand what it currently does in context.

## Routes and composition

| Route | Composition |
| --- | --- |
| `/reference/patterns` | Compact list of all 75 IDs; text/category search; disclosed surface/availability filters; Example/Planned labels. |
| `/reference/patterns/:patternId` | Purpose; supported scenario selector; full-page link and on-demand page preview; implemented/deferred scope; related documented primitives; disclosed actual source files. |

## Actions and outcomes

Every inventory ID has a stable detail URL. The catalogue derives Example/Planned counts from the living inventory; planned entries offer no fake preview or disabled action. Availability does not mean every original recipe variant is complete. Each entry states its implemented and deferred scope. Original inventory names remain searchable where an implemented composition has a clearer current title.

Search, category, surface and availability combine and survive detail/back navigation. Supported scenarios (including existing rejected board moves and form saves) are URL-backed and update Open example and the preview together. No new failure simulator or unsupported workflow is introduced.

Preview page opens the actual route in a labelled iframe. Reset preview reloads that session; closing unmounts it. Open example navigates within the main host and retains its current demo session. Source disclosures fetch exact implementation files when opened. Copy provides a manual-selection fallback; a failed source load offers retry without disabling the example.

## States and limits

Implemented: supported scenario selection, planned entry, no-results recovery, missing ID, preview reset, source loading/retry and copy. Simulation limits are stated in the relevant entry. Planned variants include alternative heroes, logo/testimonial treatments, mobile bottom navigation, advanced queries, column reordering and policies needing their own product decision.

## Responsive and accessible behavior

Reuse the accepted Reference shell, Base UI Select/Popover, labelled search and native disclosures. Desktop rows become compact stacked entries on small screens. Source lines scroll within their panel; file paths wrap. The iframe has an accessible title and uses the owning page's responsive and keyboard behavior. A full-page destination remains available without opening the preview. The fixed preview canvas is a reading window, not a forced dimension for the underlying pattern. Complete screen-reader/touch conformance and unbuilt variants are not claimed.

## Data and ownership

`src/features/reference/patterns.json` owns metadata and links; the coverage map remains the living inventory. Original source inventories are unchanged. Actual pages use their existing fixtures and supported scenarios. Each iframe starts a separate in-memory session: closing/resetting restores that session and does not mutate the surrounding host's workspace. Appearance preferences are shared through local storage. The Vite host owns raw-source imports; reusable views receive routing and source adapters.

Contract checks keep catalogue IDs aligned with coverage and verify advertised source contents against the actual files. Follow the [demo-data contract](../../demo-data.md), [quality contract](../../quality.md) and [sitemap](../../sitemap.md).
