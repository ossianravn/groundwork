# Public home

Status: core home implemented, awaiting review (2026-09-26). Shell: Public. Primary inventory ownership: MKT-02, MKT-03, MKT-06, MKT-10. The broader composition below remains a proposal where it exceeds the implemented subset.

## Implemented composition and scope

`/` has a split hero, shipped Overview screenshot linked to the live demo, three feature links, FAQ accordion and local newsletter form. The public header/footer link to Features, FAQ, sign-in and the demo; auth branding returns home. Mobile navigation uses the existing Sheet. Appearance opens the shared preference drawer.

The hero adapts [Shadcnblocks Hero 1](https://www.shadcnblocks.com/block/hero1). Existing Base UI controls and the project-aware `base-nova` Accordion own interactions. The screenshot is a fixed sample, with intrinsic dimensions and eager high-priority loading; it does not pretend to reflect current demo edits or theme. No fictional endorsements are displayed. Logos/testimonials, centered/motion variants, Product/Pricing links and expanded footer groups remain later work.

Content is loaded from `src/demo/data/public-home.json`; the host supplies typed navigation destinations. The newsletter uses required/email validation and replaces the form with a focused local confirmation. It sends and stores no email. Network pending, delivery failures and rate limits are unimplemented, not simulated through invented timers. Local completion resets when the page is left/reloaded.

## User goal

Understand the example product, see credible use cases and open the live demo.

## Routes and composition

| Route | Ordered page composition (in addition to shell) |
| --- | --- |
| `/` | Value proposition and primary CTA; split hero (MKT-02); static logo strip with optional animated reference variant (MKT-03); concise feature cards (MKT-04); sample testimonials (MKT-06); FAQ preview (MKT-09); newsletter form (MKT-10). |

## Actions and outcomes

Open demo leads to the seeded application; Product and Pricing lead to their full pages. Newsletter completion replaces the form with an announced result. A demo submission explicitly says it was simulated. Centered/split hero and motion variants live in the reference library.

## States to demonstrate

Guest/authenticated header; pending/success/field error/service error/rate-limited newsletter; missing imagery; long heading; reduced motion; light/dark.

## Responsive and accessible behavior

Keep the main CTA early in reading order. Stack hero columns on narrow screens; decorative visuals do not delay or replace the proposition. Logos/testimonials are identified as sample content; no invented verified endorsements.

## Data and persistence

Load marketing sections, sample testimonials and newsletter outcome scenarios from content.json and scenarios.json. Newsletter submission changes local UI state and sends no email. Media paths and metadata point to shipped assets.

Follows the confirmed [static JSON demo-data contract](../../demo-data.md), including shared state, scenario selection and the proposed baseline-reset behavior.

Inherits [shared shells](../../shells.md), the [quality contract](../../quality.md) and [proposed UX corrections](../../ux-decisions.md). Route authority: [sitemap](../../sitemap.md).
