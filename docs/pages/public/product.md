# Product overview

Status: core implementation awaiting review (2026-09-27). Shell: Public. Primary inventory ownership: MKT-04, MKT-05. Unimplemented variants below remain proposed.

## Implemented subset

The page uses official Base UI/base-nova Tabs for Overview, Board and Details, real shipped screenshots and explicit links to each workflow. Three feature summaries and contextual FAQ complete the page. The shared shell exposes Product/Pricing and supports appearance preferences. Content comes from `src/demo/data/public-product.json`; host navigation adapters supply the destinations. No autoplay, video or separate bento/motion variant is claimed. Images reserve their natural aspect ratio, and only the active tab's panel is mounted.

## User goal

Evaluate what the product does and inspect a representative workflow.

## Routes and composition

| Route | Ordered page composition (in addition to shell) |
| --- | --- |
| `/product` | Page heading; user-controlled product tabs and previews (MKT-05); How it works (MKT-24): four numbered steps, each linking into the demo; feature showcase (MKT-04); contextual FAQ (MKT-09); Open demo CTA. |

## Actions and outcomes

Each showcase tab has a meaningful label and changes the associated panel. Preview links open the demonstrated app destination. Autocycling is an optional reference variant with explicit pause behavior, not the initial page default.

## States to demonstrate

Active tab; media loading/unavailable; optional video open; paused/running animated variant; reduced motion.

## Responsive and accessible behavior

Place controls before previews in reading order. Avoid a carousel of unseen functionality. Screenshots have useful alternatives; any supplied video has captions and a text equivalent.

## Data and persistence

Load feature descriptions and preview metadata from content.json. Product preview links use the same project/workspace fixtures as the application. Media stays in ordinary asset files referenced by JSON.

Follows the confirmed [static JSON demo-data contract](../../demo-data.md), including shared state, scenario selection and the proposed baseline-reset behavior.

Inherits [shared shells](../../shells.md), the [quality contract](../../quality.md) and [proposed UX corrections](../../ux-decisions.md). Route authority: [sitemap](../../sitemap.md).
