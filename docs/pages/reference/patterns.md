# Pattern library

Status: implemented, awaiting review (2026-09-27). Shell: Reference. Exposes every living inventory ID. Patterns that the demo does not adopt (NAV-07 bottom tabs, MKT-12 consent, AI-24 coding agent) are shown as standalone specimens under `/reference/specimens/`, outside the demo's navigation, and preview like any other example.

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

Implemented: supported scenario selection, planned entry, no-results recovery, missing ID, preview reset, source loading/retry and copy. Simulation limits are stated in the relevant entry. Planned variants include alternative heroes, column reordering and policies needing their own product decision.

## Responsive and accessible behavior

Reuse the accepted Reference shell, Base UI Select/Popover, labelled search and native disclosures. Desktop rows become compact stacked entries on small screens. Source lines scroll within their panel; file paths wrap. The iframe has an accessible title and uses the owning page's responsive and keyboard behavior. A full-page destination remains available without opening the preview. The fixed preview canvas is a reading window, not a forced dimension for the underlying pattern. Complete screen-reader/touch conformance and unbuilt variants are not claimed.

## Data and ownership

`src/features/reference/patterns.json` owns metadata and links; the coverage map remains the living inventory. Original source inventories are unchanged. Actual pages use their existing fixtures and supported scenarios. Each iframe starts a separate in-memory session: closing/resetting restores that session and does not mutate the surrounding host's workspace. Appearance preferences are shared through local storage. The Vite host owns raw-source imports; reusable views receive routing and source adapters.

Contract checks keep catalogue IDs aligned with coverage and verify advertised source contents against the actual files. Follow the [demo-data contract](../../demo-data.md), [quality contract](../../quality.md) and [sitemap](../../sitemap.md).

## Coding agent specimen

`/reference/specimens/coding-agent` replays a recorded session in which an agent fixes a failing test in a small repository (fixture `src/demo/data/coding-agent.json`). The page opens complete so it can be read at once; Replay plays it back from the prompt, streaming each test run into the Terminal, and Show all skips to the end (the same button, so focus stays). The transcript uses the kit's Message, Reasoning and Tool pieces; tool results render as Test results with a Stack trace under the failure and the terminal output, a Code block for the file read, a diff, and a Commit. Beside it (below on narrow screens), a File tree marks the files once the agent has edited them, and selecting a file previews it as it stands at that point in the session.

## Charts

`/reference/charts` (DVIZ-16) shows every chart in the kit by family: Area, Bar, Line, Pie, Radar, Radial, Small charts and Tooltip. Each variant is a live preview on the demo's data (`gallery-data.ts`) with a Code toggle showing exactly its source: the region between `// #region <id>` and `// #endregion` in its family file. Each also links to where Tandem uses it, or says Reference only. The family is kept in the URL (`?family=bar`). To add a variant, write it in a region of its family file, then list it in `variants-cartesian.ts` or `variants-other.ts`.
