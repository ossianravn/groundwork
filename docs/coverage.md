# Inventory coverage

Status: **living inventory and demonstration map**, updated 2026-09-29. The original 73 patterns remain represented and are a starting point, not a completion target. The live catalogue now contains 109 IDs: 82 have linked examples and 27 remain planned (see [Expansion — 2026-09-29](#expansion--2026-09-29), [Foundations delivery — 2026-09-29](#foundations-delivery--2026-09-29) and [Date pickers delivery — 2026-09-29](#date-pickers-delivery--2026-09-29)). Example availability does not certify every recipe or variant. Current scope lives in `src/features/reference/patterns.json` and the owning page specifications; dated delivery notes below retain historical context and are superseded by later deliveries.

Default means included in the proposed appropriate page/shell. Variant means explicitly selectable in reference or as a view. Conditional means enabled only when the deployment supports the capability. Policy decision means its consequential behavior needs agreement before implementation. None of these labels certifies a working backend.

| ID | Supplied pattern | Primary specification | Demonstration | Treatment |
| --- | --- | --- | --- | --- |
| AUTH-01 | Unified Auth Form (Sign In / Up) | [Sign-in, registration and verification ](pages/auth/access.md) | /auth/sign-in; /auth/sign-up | Default |
| AUTH-02 | Social / OAuth Provider Buttons | [Sign-in, registration and verification ](pages/auth/access.md) | /auth/sign-in; /auth/sign-up | Default |
| AUTH-03 | Passwordless Magic Link Flow | [Sign-in, registration and verification ](pages/auth/access.md) | /auth/magic-link; /auth/check-email; /auth/callback | Default |
| AUTH-04 | 2FA / TOTP 6-Digit Input | [Sign-in, registration and verification ](pages/auth/access.md) | /auth/verify | Default |
| AUTH-05 | Multi-Step Onboarding Stepper | [Workspace onboarding ](pages/auth/onboarding.md) | /onboarding/workspace; /onboarding/team; /onboarding/complete | Default |
| AUTH-06 | Workspace Setup Wizard | [Workspace onboarding ](pages/auth/onboarding.md) | /onboarding/workspace; /onboarding/team; /onboarding/complete | Default |
| AUTH-07 | Password Reset / Recovery Flow | [Account recovery ](pages/auth/recovery.md) | /auth/forgot-password; /auth/reset-password | Default |
| AUTH-08 | Inactivity / Session Expiry Modal | [Shared shells ](shells.md) | App shell; /reference/states/session-expired | Conditional: Actual session policy determines interruption; no arbitrary countdown |
| DVIZ-01 | Metric Stat Card (KPI) | [Overview and analytics ](pages/app/overview.md) | /app/:workspace/overview; /app/:workspace/analytics | Default |
| DVIZ-02 | Area / Line Time-Series Chart | [Overview and analytics ](pages/app/overview.md) | /app/:workspace/overview; /app/:workspace/analytics | Default |
| DVIZ-03 | Segmented Bar Chart | [Overview and analytics ](pages/app/overview.md) | /app/:workspace/overview; /app/:workspace/analytics | Default |
| DVIZ-04 | Donut / Breakdown Chart | [Overview and analytics ](pages/app/overview.md) | /app/:workspace/overview; /app/:workspace/analytics | Default |
| DVIZ-05 | Date Range & Filter Picker | [Overview and analytics ](pages/app/overview.md) | /app/:workspace/overview; /app/:workspace/analytics | Default |
| EDGE-01 | Content-Geometry Skeleton Loaders | [Shared shells ](shells.md) | Shared shells; /reference/states/:scenario | Default |
| EDGE-02 | Zero-Data Empty States | [Shared shells ](shells.md) | Shared shells; /reference/states/:scenario | Default |
| EDGE-03 | Destructive Action Dialog (Guarded) | [Workspace and team ](pages/settings/workspace.md) | /app/:workspace/settings/workspace; /reference/states/destructive-action | Policy decision: Confirmation severity and recovery must be agreed for the actual operation |
| EDGE-04 | Inline Click-to-Edit Field | [Project detail, creation and editing ](pages/app/project-editor.md) | /app/:workspace/projects/:projectId | Default |
| EDGE-05 | System Error Boundaries (404/403/500) | [Failure and edge-state gallery ](pages/reference/states.md) | Runtime boundaries; /reference/states/not-found; /reference/states/forbidden; /reference/states/server-error | Default |
| EDGE-06 | Offline / Reconnecting Banner | [Shared shells ](shells.md) | Shared shells; /reference/states/:scenario | Default |
| EDGE-07 | Button Loading State Geometry Lock | [Shared shells ](shells.md) | Shared shells; /reference/states/:scenario | Default |
| EDGE-08 | Route Loading Progress Bar | [Shared shells ](shells.md) | Shared shells; /reference/states/:scenario | Default |
| EDGE-09 | App Update / Version Mismatch | [Shared shells ](shells.md) | Shared shells; /reference/states/:scenario | Default |
| MKT-01 | Sticky Glassmorphism Header | [Shared shells ](shells.md) | Public shell | Default |
| MKT-02 | Hero Section (Split & Centered) | [Public home ](pages/public/home.md) | / | Default |
| MKT-03 | Infinite Logo Marquee | [Public home ](pages/public/home.md) | /; /reference/patterns/MKT-03 | Variant: Static default; animated variant with applicable pause and motion behavior |
| MKT-04 | Bento Grid Feature Showcase | [Product overview ](pages/public/product.md) | /product | Default |
| MKT-05 | Interactive Product Showcase Tabs | [Product overview ](pages/public/product.md) | /product | Default |
| MKT-06 | Testimonial Wall / Grid | [Public home ](pages/public/home.md) | / | Default |
| MKT-07 | Pricing Matrix & Toggle | [Pricing and comparison ](pages/public/pricing.md) | /pricing | Default |
| MKT-08 | Detailed Feature Comparison Table | [Pricing and comparison ](pages/public/pricing.md) | /pricing | Default |
| MKT-09 | Searchable FAQ Accordion | [Articles, changelog and help ](pages/public/resources.md) | /help | Default |
| MKT-10 | Newsletter / Lead Capture | [Public home ](pages/public/home.md) | / | Default |
| MKT-11 | Multi-column Global Footer | [Shared shells ](shells.md) | Public shell | Default |
| MKT-12 | Cookie Consent Banner | [Privacy, terms and consent example ](pages/public/legal.md) | /privacy; public shell; /reference/patterns/MKT-12 | Conditional: Consent UI only for applicable deployed services; reference fixture remains available |
| MKT-13 | Blog / Prose Typography Layout | [Articles, changelog and help ](pages/public/resources.md) | /blog/:slug; /help/:slug | Default |
| MKT-14 | Contact Sales / Inbound Form | [Contact ](pages/public/contact.md) | /contact | Default |
| MKT-15 | Changelog / Release Notes | [Articles, changelog and help ](pages/public/resources.md) | /changelog; /changelog/:version | Default |
| NAV-01 | Collapsible Sidebar (Multi-Level) | [Shared shells ](shells.md) | App shell | Default |
| NAV-02 | Breadcrumb Trail with Dropdowns | [Shared shells ](shells.md) | App shell | Default |
| NAV-03 | Workspace / Tenant Switcher | [Shared shells ](shells.md) | App shell | Default |
| NAV-04 | User Profile Menu Dropdown | [Shared shells ](shells.md) | App shell | Default |
| NAV-05 | Global App Top Bar | [Shared shells ](shells.md) | App shell | Default |
| NAV-06 | Contextual Help & Support Widget | [Shared shells ](shells.md) | App shell | Default |
| NAV-07 | Mobile Bottom Tab Navigation | [Pattern library ](pages/reference/patterns.md) | /reference/patterns/NAV-07 | Variant: Alternative mobile shell; not added alongside an existing primary nav |
| SETT-01 | Vertical Tab Settings Layout | [Shared shells ](shells.md) | Settings shell | Default |
| SETT-02 | Floating Unsaved Changes Warning | [Project detail, creation and editing ](pages/app/project-editor.md) | /app/:workspace/projects/new; /app/:workspace/projects/:projectId/edit | Default |
| SETT-03 | Drag-and-Drop File / Avatar Uploader | [Account preferences and security ](pages/settings/account.md) | /app/:workspace/settings/profile | Default |
| SETT-04 | Team Members & RBAC Manager | [Workspace and team ](pages/settings/workspace.md) | /app/:workspace/settings/team | Default |
| SETT-05 | Invite Member Dialog | [Workspace and team ](pages/settings/workspace.md) | /app/:workspace/settings/team | Default |
| SETT-06 | API Key Generator & Manager | [API keys and webhooks ](pages/settings/developers.md) | /app/:workspace/settings/api-keys | Default |
| SETT-07 | Webhook Manager & Test Ping | [API keys and webhooks ](pages/settings/developers.md) | /app/:workspace/settings/webhooks | Default |
| SETT-08 | Plan Usage Meter & Stripe Bridge | [Billing and invoices ](pages/settings/billing.md) | /app/:workspace/settings/billing | Default |
| SETT-09 | Invoice History & PDF Download | [Billing and invoices ](pages/settings/billing.md) | /app/:workspace/settings/billing | Default |
| SETT-10 | Rich Text / Markdown Editor | [Project detail, creation and editing ](pages/app/project-editor.md) | /app/:workspace/projects/new; /app/:workspace/projects/:projectId/edit | Default |
| SETT-11 | Tag / Multi-select Input | [Project detail, creation and editing ](pages/app/project-editor.md) | /app/:workspace/projects/new; /app/:workspace/projects/:projectId/edit | Default |
| SETT-12 | Dynamic Field Arrays | [Project detail, creation and editing ](pages/app/project-editor.md) | /app/:workspace/projects/new; /app/:workspace/projects/:projectId/edit | Default |
| SYS-01 | Theme Provider & Toggle | [Theme playground ](pages/reference/themes.md) | /reference/themes | Default |
| SYS-02 | Global Command Menu (Cmd+K) | [Shared shells ](shells.md) | Shared shells | Default |
| SYS-03 | Toast Notification System | [Shared shells ](shells.md) | Shared shells | Default |
| SYS-04 | Notification Drawer / Popover | [Shared shells ](shells.md) | Shared shells | Default |
| SYS-05 | Keyboard Shortcut Overlay (?) | [Shared shells ](shells.md) | Shared shells | Default |
| SYS-06 | Skip to Content Anchor | [Shared shells ](shells.md) | Shared shells | Default |
| SYS-07 | Tooltips and dotted text hints | [Design system](design-system.md#tooltips-and-explanatory-text) | /reference/components/tooltip; Overview | Hover, activation, dismissal |
| TABL-01 | Standard App Data Table | [Projects data view ](pages/app/projects.md) | /app/:workspace/projects | Default |
| TABL-02 | Faceted Filter Toolbar | [Projects data view ](pages/app/projects.md) | /app/:workspace/projects | Default |
| TABL-03 | Column Visibility Menu | [Projects data view ](pages/app/projects.md) | /app/:workspace/projects | Default: Visibility default; optional reordering has non-drag controls |
| TABL-04 | Floating Bulk Action Bar | [Projects data view ](pages/app/projects.md) | /app/:workspace/projects | Default |
| TABL-05 | Pagination & Page-Size Controls | [Projects data view ](pages/app/projects.md) | /app/:workspace/projects | Default |
| TABL-06 | Slide-Over Inspection Drawer | [Projects data view ](pages/app/projects.md) | /app/:workspace/projects | Default |
| TABL-07 | Split-Pane / Master-Detail View | [Inbox and master-detail review ](pages/app/inbox.md) | /app/:workspace/inbox | Default |
| TABL-08 | Activity Feed & Audit Timeline | [Workspace activity ](pages/app/activity.md) | /app/:workspace/activity | Default |
| TABL-09 | Kanban / Pipeline Board | [Projects data view ](pages/app/projects.md) | /app/:workspace/projects | Variant: Board view of the same project dataset |
| TABL-10 | View Toggle (List vs Grid) | [Projects data view ](pages/app/projects.md) | /app/:workspace/projects | Default |
| TABL-11 | Advanced Query Builder | [Projects data view ](pages/app/projects.md) | /app/:workspace/projects | Variant: Advanced filters revealed on demand |

## Expansion — 2026-09-29

The maintainer asked for a status and an expanded list, then chose all four proposed groups. At expansion the catalogue held 109 IDs: 72 with linked examples and 37 planned. Variants built on 2026-09-28/29 update their existing entries rather than adding IDs: MKT-02 (hero product stage), MKT-04 (screen-tile features), MKT-10 (closing newsletter panel) and DVIZ-01 (metric strip).

### The original planned entries, now committed

- **SYS-03 Toast Notification System:** save, undo and failure feedback across projects and settings, with an action slot (pairs with EDGE-10).
- **NAV-03 Workspace / Tenant Switcher:** switch between two sample workspaces from the sidebar identity row, with the current workspace marked.
- **EDGE-07 Button Loading State Geometry Lock:** Save and Create buttons keep their width while a simulated slow save runs (uses KIT-09 spinner).
- **EDGE-08 Route Loading Progress Bar:** thin top progress bar during route loads that exceed a short threshold.
- **NAV-07 Mobile Bottom Tab Navigation:** optional phone shell with a bottom tab bar for Overview, Projects, Inbox and Activity in the reference catalogue.
- **MKT-12 Cookie Consent Banner:** reference specimen with Accept/Reject/Customize and remembered choice; stays off in the demo, which sets no tracking.
- **MKT-03 Infinite Logo Marquee:** static logo row with an optional animated marquee that pauses on hover and honours reduced motion; logos are clearly fictional samples.
- **MKT-06 Testimonial Wall / Grid:** testimonial grid on Home with clearly labelled sample quotes from fictional teams.

### Built, now catalogued

Implemented during the visual refinement and theme builder work; each has a live example.

| ID | Pattern | Primary specification | Demonstration or target | Status |
| --- | --- | --- | --- | --- |
| NAV-09 | Page actions in the top bar | [Shared shells](shells.md) | /app/demo/overview | Example |
| SETT-14 | Identity colour picker | [Project detail, creation and editing](pages/app/project-editor.md) | /app/demo/projects/brand/edit | Example |
| SYS-08 | Palette generator | [Theme playground](pages/reference/themes.md) | /reference/themes | Example |
| SYS-09 | Theme export to shadcn | [Theme playground](pages/reference/themes.md) | /reference/themes | Example |

### Kit components

Primitives the kit lacks compared with shadcn. Each is added through the kit's styling rules (token-based classes) and ships in the registry.

| ID | Pattern | Primary specification | Demonstration or target | Status |
| --- | --- | --- | --- | --- |
| KIT-01 | Switch | [Design system](design-system.md) | /app/demo/settings/notifications | Example |
| KIT-02 | Slider | [Design system](design-system.md) | seat count in billing plan selection. | Planned |
| KIT-03 | Progress | [Design system](design-system.md) | /app/demo/projects; project page and inspector | Example |
| KIT-04 | Calendar and date picker | [Design system](design-system.md) | /app/demo/projects/brand/edit; inline due date | Example |
| KIT-05 | Date-range picker | [Design system](design-system.md) | /app/demo/analytics; /app/demo/overview | Example |
| KIT-06 | Hover card | [Design system](design-system.md) | member avatars in activity and the projects table. | Planned |
| KIT-07 | Context menu | [Design system](design-system.md) | board cards and table rows. | Planned |
| KIT-08 | Keyboard key | [Design system](design-system.md) | search hint and shortcut list in /app/demo | Example |
| KIT-09 | Spinner | [Design system](design-system.md) | /reference/components/button | Example |
| KIT-10 | Scroll area | [Design system](design-system.md) | inbox list and activity preview. | Planned |
| KIT-11 | Carousel | [Design system](design-system.md) | customer stories on the public site. | Planned |
| KIT-12 | Drawer | [Design system](design-system.md) | phone filters on Projects and Activity. | Planned |

### App workflows

Workflows that make the sample workspace feel real; they reuse the kit components above where noted.

| ID | Pattern | Primary specification | Demonstration or target | Status |
| --- | --- | --- | --- | --- |
| TABL-12 | Project task list | [Project detail, creation and editing](pages/app/project-editor.md) | tasks on the project page with add, complete, assign and reorder; 24/32 becomes real. | Planned |
| TABL-13 | Comments and mentions | [Project detail, creation and editing](pages/app/project-editor.md) | project comments with @member suggestions feeding the inbox and notifications. | Planned |
| SETT-15 | File attachments | [Project detail, creation and editing](pages/app/project-editor.md) | project attachments with local previews and a simulated upload failure/retry. | Planned |
| TABL-14 | Timeline and calendar view | [Projects data view](pages/app/projects.md) | Timeline view alongside Table, Cards and Board, with a month calendar variant. | Planned |
| SETT-16 | CSV import with column mapping | [Projects data view](pages/app/projects.md) | import projects from a sample CSV: upload, map, validate, preview, import. | Planned |
| TABL-15 | Saved views | [Projects data view](pages/app/projects.md) | saved project views next to the query builder (TABL-11), shareable by URL. | Planned |
| AUTH-09 | Getting-started checklist | [Workspace onboarding](pages/auth/onboarding.md) | dismissible checklist on Overview after onboarding, ticking off as steps happen. | Planned |
| EDGE-10 | Undo after destructive actions | [Shared shells](shells.md) | /app/demo/projects (bulk and board); Mark complete | Example |
| SYS-10 | Search results page | [Shared shells](shells.md) | Enter in command search opens grouped results with filters. | Planned |

### Public showcase

New public pages and sections in the Tandem brand layer. Company, customer and integration content is clearly fictional sample content.

| ID | Pattern | Primary specification | Demonstration or target | Status |
| --- | --- | --- | --- | --- |
| MKT-18 | Integrations directory | [Sitemap](sitemap.md) (page specification to write) | /integrations with sample, clearly fictional integrations. | Planned |
| MKT-19 | Customer story | [Sitemap](sitemap.md) (page specification to write) | /customers/:slug with a fictional sample team. | Planned |
| MKT-20 | About and careers | [Sitemap](sitemap.md) (page specification to write) | /about with a sample roles list. | Planned |
| MKT-21 | Public roadmap | [Sitemap](sitemap.md) (page specification to write) | /roadmap with local votes and links to the changelog. | Planned |
| MKT-22 | Status page | [Sitemap](sitemap.md) (page specification to write) | /status with sample components and incident history. | Planned |
| MKT-23 | Stats band | [Public home](pages/public/home.md) | Home band with display-face figures from the sample workspace. | Planned |
| MKT-24 | How it works | [Product overview](pages/public/product.md) | Product page steps linked to the demo. | Planned |
| MKT-25 | Announcement bar | [Shared shells](shells.md) | public shell bar linking the latest changelog entry. | Planned |

## Foundations delivery — 2026-09-29

Build-order step 1 turned eight planned entries into examples: SYS-03, EDGE-07, EDGE-08, EDGE-10, KIT-01, KIT-03, KIT-08 and KIT-09.

- **SYS-03, EDGE-10:** the kit's ToastProvider mounts once at the root. Mark complete and board moves confirm in a toast with Undo; table bulk changes offer Undo inline beside the existing outcome, where retry already lives. Undo restores the earlier project values and removes the change's activity; a project edited again since keeps that edit. Tag and link removal are unchanged.
- **EDGE-07, KIT-09:** `Button` takes `loading`, keeping the label's width under a spinner and staying focusable. The project form accepts an asynchronous save, locks its fields and reports Saving…. Product saves remain immediate; the delay exists only in the Slow save gallery scenario and the Button reference example. This supersedes the 2026-09-26 EDGE-07 deferral below.
- **EDGE-08:** a 2px brand bar appears when a route's code or data takes longer than 150 ms, then completes and fades. Most demo navigations finish sooner, so it is usually invisible.
- **KIT-01, KIT-03, KIT-08:** notification preferences use Switch; every native project `<progress>` is now the kit Progress in the project's hue; the shortcut list and the top-bar search hint use Kbd with the platform's modifier.

## Date pickers delivery — 2026-09-29

Build-order step 2 added KIT-04 and KIT-05 and completed the custom range in DVIZ-05, using `react-day-picker` and `date-fns` (approved by the maintainer).

- **KIT-04:** the kit Calendar adapts shadcn's base-nova source; `DatePicker` takes and returns ISO dates, starts weeks on Monday and names its trigger with the field label plus the chosen date. Project due dates use it in the editor (create and edit) and in inline editing, where Escape closes the calendar before it cancels the edit.
- **KIT-05, DVIZ-05:** Overview and Analytics accept `from`/`to` in the URL beside the 7/14/30-day `period`; an invalid, reversed or over-92-day range falls back to the preset. The dates above the chart open the range calendar, and the period Select gains Custom range. Days after the snapshot cannot be chosen. The snapshot day is drawn at full strength only when the range includes it. This supersedes the DVIZ-05 "custom ranges remain planned" note below.

## Inventory development

The original [CSV](inventory/shadcn-fullstack-template-spec.csv) and [detailed recipes](inventory/table-spec-details.md) remain source snapshots. This document is the evolving index. Add a pattern when a workflow exposes a distinct reusable need; give it a stable ID, one specification owner, a meaningful demonstration and the states that establish useful coverage. Refine, split, merge or retire entries when evidence supports it, recording the replacement so existing references remain intelligible. Do not inflate the list with renamed variants or require every pattern on every page.

Completing the original 73 entries is not the definition of a finished template. Evaluate coherent workflows, reusable design quality and demonstrated behavior. Inventory counts describe the catalog, not product quality or percentage complete.

### Additions from the Projects workflow

These additions now have implemented core demonstrations, with scope-specific evidence below. Their owning page specifications define behavior and acceptance; richer variants remain planned.

| ID | Added pattern | Primary specification | Demonstration | Why it is distinct |
| --- | --- | --- | --- | --- |
| NAV-08 | Return to results with preserved context | [Projects data view](pages/app/projects.md) | Projects → detail/edit → results | Breadcrumbs describe hierarchy; this pattern preserves filters, sort, page, scroll and useful focus across a round trip, including direct entry and changed results. |
| SETT-13 | Validated form submission and recovery | [Project detail, creation and editing](pages/app/project-editor.md) | Project creation/editing | Covers field errors, retained values, rejected saves, retry and visible success. It is separate from dirty-work warnings, rich-text controls and route-crash boundaries, and can be reused in contact/account/workspace forms. |

## Coverage interpretation

Shared-shell patterns are present on routes that inherit that shell; they do not need their own product navigation pages. The reference state gallery is the additional inspection surface for loading, error and recovery examples. A source recipe can remain covered even when its original behavior is deliberately revised; consult [UX decisions](ux-decisions.md).

Page specifications list their primary IDs and may compose other patterns. This reverse index establishes primary ownership so a future change has one clear documentation home. The input files remain the inventory evidence; [sitemap](sitemap.md) remains the route authority.

## Projects-phase implementation disposition

Updated 2026-09-25 from the actual router, persistent workspace owner, reused table and project overlays. **Implemented subset** means only the named behavior exists; it does not certify the full source recipe or its mandatory states. **Later** retains inventory scope without expanding the first delivery.

| IDs | Current evidence / implementation | Projects delivery |
| --- | --- | --- |
| TABL-01 | Implemented subset: dedicated list reuses the controlled table; name links address full details; Overview stays reusable | Routed create/edit and saved results implemented |
| TABL-02 | Implemented subset: URL search, multi-value Status/Owner facets/counts, valid page reset and reload/history reconstruction | Detail/editor return verified, including changed filter membership |
| TABL-03 | Implemented subset: reused column visibility survives inspection/query updates and detail navigation; session view state | Column reordering remains an optional later variant |
| TABL-05 | Implemented subset: URL-backed page size/page, first/previous/next/last and Back; invalid pages clamp | Detail/editor round trip verified |
| TABL-06 | Implemented subset: URL-backed live B Sheet, completion feedback and focus return, missing-record recovery | Full-detail and editor links verified |
| TABL-08 | Implemented subset: workspace preview/expansion and newest-first project activity on detail; create/edit/completion are reflected immediately | Dedicated Activity page remains later |
| NAV-02 | Implemented subset: active Overview/Projects navigation, page titles and shell context; mobile destination focus | Detail breadcrumb and explicit origin return implemented; dropdown variants remain later |
| SYS-02, SYS-06 | Implemented subset: shared project search and skip link across both routes, inspector handoff and return focus | Broader command categories/history remain later |
| SETT-02 | Implemented subset: approved in-session drafts survive navigation; dirty feedback, Cancel discard, save/reset/reload clearing | No blocking leave prompt or persistent draft storage; richer settings autosave remains later |
| EDGE-02, EDGE-05 | Implemented subset: URL no-match clearing, unknown/reload-lost inspected project recovery and host error boundaries | Missing/reload-lost detail/editor recovery verified; named save rejection/retry implemented |
| EDGE-07 | Ordinary and named rejected saves are synchronous; no artificial pending operation | Pending geometry remains later when an actual asynchronous workflow exists |
| TABL-04 | Implemented: page/all-matching selection, Assign owner, Mark complete, named partial failure/retry | [Projects bulk scope](pages/app/projects.md#states-to-demonstrate); synchronous demo, network pending unimplemented |
| TABL-09 | Board columns, pointer/keyboard dragging, menu-based status moves, empty columns and failed-move retry implemented | Ready for review; reopening preserves completed tasks; shared Sort owns column order |
| TABL-10 | Implemented: Table/Cards, URL view state and shared results/actions | [Alternate-view scope](pages/app/projects.md#states-to-demonstrate); synchronous data, loading skeletons not implemented |
| TABL-11 | On-demand flat Match all/any builder, applied URL state and shared Table/Cards/Board results | Name/status/owner/date/progress; nested groups and saved queries remain separate |
| EDGE-04 | Not implemented: inline Save/Cancel editing | Later: after the routed edit boundary is established |
| SETT-10 | Rich description editing, formatted details/history and Reference example implemented | Markdown, media and collaboration remain later work |
| SETT-11, SETT-12 | Tag search/selection/inline creation and repeatable related links are demonstrated in the shared editor/details | Saved names are reused case-insensitively; no separate tag-management service |
| NAV-08 | Implemented core subset: URL query/sort/page, session column visibility, Overview table/activity state, vertical/horizontal scroll and opener focus; direct/missing entry and changed filter membership | Editor round trip verified; excluding edit preserves filters and useful results focus |
| SETT-13 | Implemented subset: shared routed create/edit fields and validation, focused field errors, named rejection with retained values, retry commits once, visible saved detail | Local synchronous save only; API/network/conflict behavior is not claimed |

No percentage-complete claim is derived from component presence. Further workflows can add or revise entries; the current list is not a ceiling. The remaining rows retain their planned status and specification owners.

## Account-settings disposition — 2026-09-26

- **SETT-01:** Profile, Appearance and Notifications are routed settings sections, with desktop local navigation and narrow-screen links. Other settings destinations remain planned.
- **SETT-02:** Account forms add retained session drafts, explicit Save/Cancel, and in-place saved feedback. Navigation does not discard edits; reload/reset clears them. No floating unsaved-warning bar is needed for this policy.
- **SETT-03:** Local photo picker, preview, removal and invalid-image recovery are implemented. Drag-and-drop, cropping and remote-upload progress/retry are not implemented.
- **SYS-01:** The Appearance page/drawer share site preferences. `/reference/themes` adds an isolated draft preview, named device presets, semantic colors, selected contrast pairs, JSON import/export and CSS export. See the theme specification for integration and coverage limits.

The [account specification](pages/settings/account.md#implemented-composition-and-scope) owns the exact composition, state and persistence boundaries. These subsets do not claim completion of every original recipe state.

## Access/recovery disposition — 2026-09-26

- **AUTH-01:** Sign-in/registration, labels, required/email validation, password visibility/autofill and local return routing implemented. Real credentials/sessions are not implemented.
- **AUTH-03:** Email request, receipt, replacement and single-use callback with retained local return context are implemented. Missing/used/replaced/reload-lost links recover through a new request. No email delivery, authentication provider, cooldown or timed expiry.
- **AUTH-07:** Local request/receipt/reset/sign-in sequence, single-use link, unavailable-link recovery and retained workspace context implemented. No mail transport, stored password or provider operation.
- **AUTH-05/06:** Workspace, optional Team and Ready steps with named progress, retained drafts, atomic workspace/invitation creation, Skip and a completion summary are implemented. Slug availability, setup uploads and guided tour remain deferred; AUTH-02/04 provider/OTP remain planned.

The access, recovery and onboarding specifications own these simulation boundaries; original inventory rows remain planned coverage, not completion claims.

## Workspace/team disposition — 2026-09-26

- **SETT-02, SETT-03:** Workspace name/logo, shared image selection, retained draft, Save/Cancel and reset/reload implemented.
- **SETT-04:** Searchable member roster, role changes, approved sole-owner protection and removal with atomic project reassignment implemented. Historical actors remain identifiable; production permissions and self-removal remain later work.
- **SETT-05:** Local pending invitations, duplicate feedback and cancellation implemented. Acceptance, expiry and actual delivery are not implemented.
- **EDGE-03:** Workspace deletion remains proposed; this delivery does not establish its confirmation policy.

The [workspace/team specification](pages/settings/workspace.md#implemented-composition-and-scope) owns composition and exact scope. Original inventories remain unchanged.

## Public-home disposition — 2026-09-26

- **MKT-01, MKT-11:** Shared sticky public navigation, mobile Sheet, footer destinations and Appearance implemented. Header is solid for readability; authenticated/public menu variants and larger footer groups remain later.
- **MKT-02:** Split hero with real shipped demo preview and working CTAs implemented. Centered and motion variants remain planned.
- **MKT-04:** Three concise home features link to actual workflows. This is not the planned Product-page bento showcase.
- **MKT-09:** Home FAQ accordion implemented; searchable help and categories remain planned.
- **MKT-10:** Local newsletter required/email validation and focused completion implemented. No delivery, service errors or rate limits.
- **MKT-03, MKT-06:** Logos/testimonials remain planned; the home does not invent endorsements to fill these rows.

The [home specification](pages/public/home.md#implemented-composition-and-scope) owns exact scope. These are subsets of the evolving inventory, not claims that each original recipe is complete.

## Product/Pricing disposition — 2026-09-27

- **MKT-04, MKT-05:** Product summaries and manual keyboard-operable preview tabs with real assets and matching destinations. Bento, autoplay and video variants remain planned.
- **MKT-07:** Approved sample catalog, monthly/yearly amounts and explicit billing totals, plan selection through local sign-up and workspace creation. No checkout or feature enforcement.
- **MKT-08:** Disclosed comparison with semantic row/column headers and contained narrow-screen scrolling. Currency and unavailable/current-plan variants remain planned.
- **MKT-09:** Product and Pricing FAQs reuse the shared accordion boundary.

The [Product](pages/public/product.md) and [Pricing](pages/public/pricing.md) specifications own exact implementation scope.

## Resource-content disposition — 2026-09-27

- **MKT-01, MKT-11:** Resources navigation groups Articles, Changelog and Help on desktop; mobile and footer have real destinations.
- **MKT-13:** Article/help indexes and readers, authored local content, image/caption, section links, responsive TOC, related entries and missing-entry recovery. Code-copy, blockquotes, pagination and richer media states remain planned.
- **MKT-15:** Sample release timeline/details, categorized changes, adjacent release navigation and related help implemented. Release numbers are illustrative content, not package-version claims.
- **MKT-09:** Help search across guide bodies, grouped topics, no matches, URL query/history and linked FAQ answers implemented. Contact and in-app contextual help remain planned.

The [resource specification](pages/public/resources.md#implemented-composition-and-scope) owns exact scope; original source inventories remain intact.

## Contact and legal implementation disposition — 2026-09-27

- **MKT-14:** Contact form with native required/email validation, retained navigation draft, local completion and named failure/retry. Values clear on completion/reset/reload. Real delivery, service pending and rate-limit states remain outside the local example.
- **MKT-13:** Privacy and Terms reuse the prose reader, section anchors and responsive contents disclosure. Content is explicitly sample/replacement-required.
- **MKT-12:** No consent UI is needed for the current application without optional tracking services. The consent reference demonstration remains planned, not implemented.

The [Contact](pages/public/contact.md) and [legal](pages/public/legal.md) specifications own the scope and state contracts.

## Inbox and notifications disposition — 2026-09-27

- **TABL-07:** Flush responsive conversation workspace, URL selection/filter, keyboard resizing/reset, member-addressed Compose, threaded Reply, retained navigation drafts, explicit read/unread, empty/unavailable states and project return context. Pane collapse and asynchronous loading remain planned.
- **SYS-04:** Shared notification Sheet, message links/View all, unread indicators and Mark all read. Fixture-backed session state and named read-action failure/retry; no push/email service.
- **NAV-08:** Inbox selection/filter and useful focus survive the linked project round trip.

The [Inbox specification](pages/app/inbox.md) owns exact scope and deferred variants.

## Analytics disposition — 2026-09-27

- **DVIZ-02:** Existing daily time series reused in Analytics with page-level scope and a readable daily table.
- **DVIZ-03:** Single-series horizontal project bars, labelled counts and linked data table. Grouped/stacked and legend-filter variants remain planned.
- **DVIZ-04:** Contributor task-share donut with stable member colors, visible values and a table alternative. No hover-only values or invented comparisons.
- **DVIZ-05:** Shared URL-backed preset period/project filters. Custom ranges and comparison controls remain planned.
- **NAV-08:** Project detail return preserves Analytics filter/data view, scroll and useful opener focus.

The [Analytics scope](pages/app/overview.md#implemented-analytics--2026-09-27) owns exact behavior and deferred variants.

## Developer settings delivery — 2026-09-27

| Pattern | Demonstration | Disposition |
| --- | --- | --- |
| SETT-06 | `/app/demo/settings/api-keys` | Local create, one-time dummy reveal/copy/manual-copy recovery and revocation; expiry, asynchronous and permission variants deferred. |
| SETT-07 | `/app/demo/settings/webhooks` | Endpoint create/edit, event selection, inline delivery/response disclosure and named simulated failure/retry; no network delivery or signing. |

The [developer settings specification](pages/settings/developers.md) owns behavior and limits. Original inventories remain intact.

## Billing disposition — 2026-09-27

- **SETT-08:** Current sample plan, actual member/project counts, monthly/yearly workspace totals and local plan selection in a dialog. Existing sign-up selection is reused. Quotas, warning states and external portal/payment integration remain deferred.
- **SETT-09:** Paid invoice history, empty history and three real same-origin sample PDFs generated from immutable invoice snapshots. Native browser saving remains unverified because the automation download command cancels; direct PDF serving, contents and rendering passed. Other invoice statuses and asynchronous service states remain deferred.

The [Billing specification](pages/settings/billing.md) owns exact behavior and limits. Original inventories remain unchanged.


## Reference infrastructure — 2026-09-27

`/reference`, `/reference/components` and `/reference/components/:component` now document ten shared primitives through interactive examples, exact example source, usage notes and real workflow links. Search supports category, task/name and related inventory IDs. Metadata lives in `src/features/reference/components.json`; the [library specification](pages/reference/library.md) owns behavior and limitations. This is documentation infrastructure, not a claim that ten patterns—or all 73 initial patterns—are complete. Pattern catalogue/detail routes, the theme playground and state gallery remain planned.

## State-gallery disposition — 2026-09-27

`/reference/states/:scenario` now exposes thirteen isolated, resettable specimens. [State gallery](pages/reference/states.md) owns behavior and limits; the pattern catalogue links to each relevant example.

- **EDGE-01:** A held loading fixture resolves to the shared Projects results. No real request interception.
- **EDGE-02:** First-use creation and no-results clearing use the existing form/results compositions.
- **EDGE-03:** Existing member-removal dialog and atomic reassignment are inspectable in isolation.
- **EDGE-05:** Access-denied, missing-content and failed-request recovery specimens supplement existing route boundaries; they do not return HTTP error statuses.
- **EDGE-06, EDGE-09, AUTH-08:** Connectivity, update and session-resumption specimens retain a draft. Production connection/session/update services remain unimplemented.
- **SETT-02, SETT-13:** Existing draft retention, Cancel discard and save retry have direct gallery entries.
- **EDGE-04, EDGE-07, EDGE-08:** Inline editing, asynchronous action geometry and route progress remain deferred; gallery presence does not claim these implementations.

### Security settings and MFA delivery (2026-09-27)

AUTH-04 now has a local setup and verification example: six-digit entry/paste, explicit Verify, single-use recovery codes, code replacement, disabling and both sign-in handoffs. Security also supplies a compact sample session list and event disclosure. No real TOTP/provider, remote session termination or complete accessibility coverage is claimed. See [account](pages/settings/account.md) and [access](pages/auth/access.md) for exact scope.

## Provider access demos — 2026-09-27

AUTH-02 now has local Google/GitHub choices, continuation, single-use callback, enabled MFA handoff and selected-plan onboarding. Cancel, unavailable/retry and missing/used attempt recovery are demonstrated. `src/features/auth/provider-buttons.tsx`, `provider-continuation.tsx`, `src/demo/provider-access.ts` and the host provider routes own the implementation. The public catalogue links to three examples and their source. This brings example availability to 60 of 75 entries; it does not establish complete recipe coverage. Real OAuth, account linking and production authorization remain deferred.

## Activity and contextual help - 2026-09-27

- **TABL-08:** dedicated filtered Activity history, chronological groups, Load more, event details and project-return context. New edits/owner/status changes capture actual before/after values; fixture events keep their known facts.
- **NAV-06 / SYS-05:** contextual Help via one sidebar action; existing guide disclosure, Help center/Contact destinations, and working search/help shortcuts.
- **SYS-07:** dotted-underlined explanatory terms use the shared TextHint; hover and pointer/keyboard activation reveal the same content. Existing icon tooltips retain accessible names. The reference library now has eleven documented component examples.

These are local demonstrations. Remote history, support services, workspace switching, richer editing/query patterns and remaining reference variants stay deferred.

## Contextual project editing — 2026-09-27

EDGE-04 now demonstrates name, owner and due-date editing on project details, including explicit Save/Cancel, field-only commits, shared navigation drafts, validation and rejected-save retry. The full editor retains longer fields. See the [project editor specification](pages/app/project-editor.md) for behavior and the active plan for verification limits.
