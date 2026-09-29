# Privacy, terms and consent example

Status: Privacy and Terms specimens implemented, 2026-09-27; consent specimen at `/reference/specimens/cookie-consent`, 2026-09-29 (the demo itself shows no banner). Shell: Public. Primary inventory ownership: MKT-13; conditional MKT-12.

## User goal

Find the example site's policy information and control optional processing where present.

## Routes and composition

| Route | Ordered page composition (in addition to shell) |
| --- | --- |
| `/privacy` | Policy page heading, update date, readable prose and section anchors (MKT-13); preferences trigger when applicable (MKT-12). |
| `/terms` | Terms page heading, update date, readable prose and section anchors (MKT-13). |

## Actions and outcomes

Example policy text is clearly marked as a replacement-required specimen. Both routes are reachable in the shared footer and link to each other and Contact. Section links use the shared reader's desktop contents list and narrow disclosure.

The current application includes no optional analytics or advertising integration; it adds no consent banner. A future reference-library consent demonstration remains planned. If a deployment adds applicable optional processing, its preferences must be revisitable and reflect actual services; these sample pages do not establish deployment compliance.

## States to demonstrate

Implemented: sample policy content, working section anchors and no consent UI needed for the current demo. Planned reference states: first applicable visit; preferences open; necessary-only; selected categories; saved; unavailable optional service.

## Responsive and accessible behavior

Policy text uses the shared prose pattern. A banner does not obscure focused controls or required actions. Preference groups have labels and actual state.

## Data and persistence

`content.json` owns both specimens. Privacy describes actual in-memory demo data, contact input lifetime and persisted appearance preferences. It distinguishes application behavior from the host/deployment's unknown processing. Terms describes the illustrative workspace, account flows and sample pricing without inventing a live contract or legal jurisdiction. Actual operator identity, processing, rights, commercial commitments and legal terms remain an adopter responsibility.

Consent scenarios and preference controls have not been implemented. The [ICO privacy-notice guide](https://ico.org.uk/for-organisations/advice-for-small-organisations/privacy-notices-and-cookies/how-to-write-a-privacy-notice-and-what-goes-in-it/) informs the replacement checklist; the specimens are not ready-to-use legal advice.

Follows the confirmed [static JSON demo-data contract](../../demo-data.md), including shared state, scenario selection and the proposed baseline-reset behavior.

Inherits [shared shells](../../shells.md), the [quality contract](../../quality.md) and [proposed UX corrections](../../ux-decisions.md). Route authority: [sitemap](../../sitemap.md).
