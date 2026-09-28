# Articles, changelog and help

Status: core routes implemented, awaiting review (2026-09-27). Shell: Public. Primary inventory ownership: MKT-09, MKT-13, MKT-15. The broader variants below remain proposed unless listed in the implemented scope.

## Implemented composition and scope

- `/blog`: one featured article with a real demo image, then two text-led entries. `/blog/:slug`: authored prose, image/caption, date/byline, section anchors, related reading and missing-entry recovery.
- `/changelog`: three dated, explicitly sample releases. `/changelog/:version`: categorized notes, deep section links, related help and older/newer navigation.
- `/help`: bounded live search across five guides, grouped topics, no-match recovery and three Base UI FAQ disclosures. Query is URL-backed; Back from a guide restores it. FAQ hash destinations open the corresponding answer. `/help/:slug` reuses the reader with an updated date, ordered steps where useful, related guides and missing-entry recovery.
- Resources is a single shadcn Base UI Dropdown Menu in the desktop header and direct links in the mobile Sheet/footer. Existing tokens and typography govern controls; prose has a bounded measure and distinct heading hierarchy. Reader top spacing uses the shared page inset instead of index-page section spacing. The TOC is sticky on wide layouts and a native disclosure on narrow layouts; both highlight the current section with an accent rail, weight and `aria-current="location"`.
- Scrollspy follows the existing sticky-header anchor clearance, updates on scrolling and layout changes, and handles short final sections at the page bottom. Passive reading changes neither history nor focus. Native anchor navigation retains hash links and heading focus. A small shared JavaScript hook owns visual/accessible state across browsers; native CSS scroll-target tracking would still require an accessibility sync and an additional fallback.
- Data: `src/demo/data/content.json`; content/search: `src/features/resources`; route adapters: `src/app/resource-route.tsx`; public route declarations: `src/app/public-routes.ts`. Reusable views do not import the demo router.
- No pagination for these small collections, CMS/search service, simulated service failure or loading delay. Code/copy, blockquotes, image-error UI, contact fallback and in-app contextual help remain planned. No fabricated support channel is exposed. Hosting metadata, prerendering/SEO and HTTP missing-resource status remain host responsibilities.

The [Base UI Dropdown Menu](https://ui.shadcn.com/docs/components/base/dropdown-menu) supplies the navigation primitive; existing public compositions and the local design system own layout. Jev favored grouped Resources navigation and guide-first Help. Content reflects the inspected demo behavior, including reset versus appearance persistence, draft/Cancel behavior, reopening completed work, and team ownership rules.

## User goal

Read useful content, understand changes and resolve a product question.

## Routes and composition

| Route | Ordered page composition (in addition to shell) |
| --- | --- |
| `/blog` | Page title; topic/search controls when useful; article cards; pagination (MKT-13). |
| `/blog/:slug` | Article title, author/date; prose body; image/caption, code/copy and blockquote examples; table of contents; related articles (MKT-13). |
| `/changelog` | Release timeline with type labels, date and links; pagination (MKT-15). |
| `/changelog/:version` | Release heading; categorized changes; deep links; previous/next release (MKT-15, MKT-13). |
| `/help` | Help search; topic links; FAQ accordion; contact fallback (MKT-09). |
| `/help/:slug` | Help article; table of contents when useful; related help; contact fallback (MKT-13, MKT-09). |

## Actions and outcomes

Article and release entries have real destinations. Help search distinguishes no matches from service failure. FAQ hash links open the requested answer without surprising focus changes. Copy code reports success/failure. Contextual in-app help reuses the same content.

## States to demonstrate

Content loading; no articles/releases yet; search no matches; missing slug/version; copied/copy unavailable; long headings/code; image failure.

## Responsive and accessible behavior

Readable prose measure and hierarchy; TOC becomes a disclosure on narrow screens. Code can scroll within its own region. Pagination provides a navigable history; loading more items is an optional enhancement.

## Data and persistence

Load article, help and release records from content.json, with stable slugs and references to shipped assets. Search and pagination operate locally. JSON contains the example content; no CMS or search backend is required. Metadata and public-page rendering remain responsibilities of the demo host.

Follows the confirmed [static JSON demo-data contract](../../demo-data.md), including shared state, scenario selection and the proposed baseline-reset behavior.

Inherits [shared shells](../../shells.md), the [quality contract](../../quality.md) and [proposed UX corrections](../../ux-decisions.md). Route authority: [sitemap](../../sitemap.md).
