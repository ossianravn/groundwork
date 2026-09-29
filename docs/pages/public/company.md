# Company pages

Status: implemented (2026-09-29). Shell: Public. Primary inventory ownership: MKT-18, MKT-20, MKT-21, MKT-22. All content is fictional sample data in `src/demo/data/public-company.json`, and each page says so.

## User goal

Before committing to a product, check that it fits the tools already in use, who makes it, where it is going and whether it is dependable.

## Routes and composition

| Route | Ordered page composition (in addition to shell) |
| --- | --- |
| `/integrations` | Page heading; search and category toggles; live result count; card grid (three, two or one per row) with a status badge for Beta and Coming soon; an empty state that suggests another word or category. |
| `/about` | Page heading; the team's story at a reading measure; three numbered values; open roles, each with an Ask about this role link to Contact. `#careers` targets the roles section. |
| `/roadmap` | Page heading; Now, Next, Later and Shipped columns (four, two or one per row). Planned items carry a vote toggle; shipped items link to the changelog. |
| `/status` | Page heading; overall status; per-component rows with 90 daily bars (oldest left), uptime and current state; past incidents with their timed updates. |

## Actions and outcomes

- Integrations: category and search terms combine; every term must match the name or description. The count announces the result.
- Roadmap: a vote toggles `aria-pressed` and the count by one. The accessible name stays "Vote for …, n votes", so the name does not flip with state. Votes live in session UI memory: they survive navigation, and reset with the demo or on reload.
- Status: the bars are decorative; each row's list carries its uptime as an accessible name. There is no live service, and the page says so.

## Responsive and accessible behavior

Filters wrap before the page can overflow. Card and column titles are `h2`/`h3` for structure, at body size rather than display size. On narrow screens, role links stack under the role. Status bars keep all 90 days, with a 1px gap.

## Data and persistence

Static JSON only; no integration connects to anything. Follows the [static JSON demo-data contract](../../demo-data.md). Inherits [shared shells](../../shells.md) and the [quality contract](../../quality.md). Route authority: [sitemap](../../sitemap.md).
