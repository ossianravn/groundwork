# Pricing and comparison

Status: core implementation awaiting review (2026-09-27). Shell: Public. Primary inventory ownership: MKT-07, MKT-08. Unimplemented states below remain proposed.

## Implemented subset and approved catalog

The user approved illustrative USD Starter ($0), Team ($12/member/month or $120/year) and Business ($24/member/month or $240/year). `src/demo/data/billing.json` owns prices, highlights, sample comparison and FAQ; `src/demo/billing.ts` owns selection and price formatting. Feature packaging is illustrative and imposes no restrictions on the demo.

The three-column cards adapt [Shadcnblocks Pricing 1](https://www.shadcnblocks.com/block/pricing1), using existing primitives and shared tokens. The exclusive monthly/yearly choice is a ToggleGroup, not Tabs. Yearly displays $10/$20 per month alongside $120/$240 per member billed yearly. Compare all features reveals a semantic table in a keyboard-focusable horizontal scroll region on narrow screens.

Plan and period travel in sign-up search parameters, appear in sign-up/workspace setup, and are retained in the new workspace identity. Change plan returns to the chosen billing period. Ordinary sign-up has no imposed plan. Reload/Reset restore the existing fixture. Billing settings, checkout, Enterprise/sales contact, tax calculation, currency switching and enforced feature entitlements are not implemented. No missing Contact destination is advertised.

## User goal

Compare plans and understand the actual billing basis before choosing a next action.

## Routes and composition

| Route | Ordered page composition (in addition to shell) |
| --- | --- |
| `/pricing` | Page heading; labelled billing-period choice and pricing cards (MKT-07); feature comparison (MKT-08); billing FAQ (MKT-09); sales contact link. |

## Actions and outcomes

Changing billing period updates price, billing frequency and total consistently. Selecting a plan carries that choice into sign-up; enterprise leads to Contact. Use a labelled exclusive-choice control; Tabs only if switching actual tab panels. Currency selection is conditional on supported pricing.

## States to demonstrate

Monthly/annual; current plan; unavailable plan; optional supported currency; comparison expanded/collapsed; missing price data; sample-price label.

## Responsive and accessible behavior

Keep row/column associations intact in the comparison. A narrow version can show one plan at a time with the same feature labels, or a contained scroll region. Tooltips supplement text and work on focus.

## Data and persistence

Read the shared plan catalog from billing.json, also used by the billing settings page. Billing-period and supported-currency selection update the local view; plan choice passes into the simulated sign-up flow. No checkout provider is required.

Follows the confirmed [static JSON demo-data contract](../../demo-data.md), including shared state, scenario selection and the proposed baseline-reset behavior.

Inherits [shared shells](../../shells.md), the [quality contract](../../quality.md) and [proposed UX corrections](../../ux-decisions.md). Route authority: [sitemap](../../sitemap.md).
