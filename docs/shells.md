# Shared shells and global behavior

Status: proposed. Applies to every page through its shell assignment in the [sitemap](sitemap.md).

## Composition

| Shell | Shared elements, in reading order | Patterns |
| --- | --- | --- |
| Base | Skip link; route content with one main landmark; shared overlay/announcement host; local feedback | SYS-01, SYS-03, SYS-06, EDGE-01, EDGE-02, EDGE-05, EDGE-06, EDGE-07, EDGE-08, EDGE-09 |
| Public | Base; public header and mobile navigation; main page; footer; consent preferences when relevant | MKT-01, MKT-11, MKT-12 |
| Auth | Base; brand/home link; theme control; focused form or process; relevant help/legal links | SYS-01, SYS-06; form patterns supplied by route |
| App | Base; workspace switcher; sidebar; top bar with breadcrumbs/search/notifications/profile; main page; help and shortcut overlays | NAV-01, NAV-02, NAV-03, NAV-04, NAV-05, NAV-06, SYS-02, SYS-04, SYS-05, AUTH-08 |
| Settings | App; settings subnavigation; page heading; one settings section | SETT-01; form patterns supplied by route |
| Reference | Base; library navigation and search; main reference content; links to public and app examples | SYS-02; documentation controls belong here |

These are compositions, not a requirement for six nested wrappers. Each rendered page has one main landmark and one skip destination. Repeat neither headers nor live regions when shells compose.

All shell data and session/permission scenarios use the shared [static JSON demo-data contract](demo-data.md). References to requests, sessions and service outcomes below describe locally simulated interactions in this template.

## Public navigation

Header: Product, Pricing, Resources, Sign in, Open demo. Resources links to articles, changelog and help. The footer supplies Contact, Privacy, Terms and cookie preferences when that capability exists. Reference library is a clearly labelled template link. Mobile navigation uses a labelled Sheet with a title and visible close action.

The header may be sticky; transparency is an optional visual variant. Readability must hold over every underlying surface. The signed-in state changes the account action to Open app. Public search is scoped to content/help; it does not expose private records or require a global command shortcut.

## App navigation

Primary: Overview, Projects, Inbox, Analytics. Secondary: Activity, Settings, Help. The workspace switcher owns the current workspace; the profile menu owns account settings, appearance and sign-out. Breadcrumbs reflect actual hierarchy and use links for ancestors.

Desktop sidebar supports expanded and icon modes. Narrow layouts use a Sheet. NAV-07 is a separate mobile navigation variant demonstrated in the reference library; it is not layered on top of another primary navigation. If adopted, labels and destinations remain stable while scrolling.

The App top bar stays sticky while the page scrolls, at a constant height. Its glass surface uses shared opacity/blur tokens with a solid fallback. Appearance offers Glass (the current demo default), Solid and System; System follows reduced-transparency preferences. Forced-colors mode always uses a solid surface. Anchor and keyboard scrolling must account for the header so destinations remain visible. This behavior is implemented in the overview's shared shell.

Settings links: Profile, Appearance, Notifications, Security; Workspace, Team, Billing; API keys, Webhooks. Account and workspace sections are visibly grouped. Settings sections are routes with links and aria-current, not ARIA tabs unless they actually switch panels on one page.

## Shared overlay behavior

- Search has grouped destinations/actions/records, loading, no results and failure states. Commands respect current workspace permissions. A visible button is always available.
- Notification drawer has Unread/All tabs, mark-as-read actions and links to the underlying project or request. Failed updates remain retryable; unread counts reflect confirmed state.
- Workspace switching preserves the old scope until the new one loads, then clears selections and cached views that belong to the previous scope. Explain lost access with a usable next destination.
- Shortcut help lists platform-specific keys. Single-character shortcuts require an off/remap option or focus-scoped activation; do not fire while typing. No workflow depends on shortcuts.
- Contextual help opens relevant content and a contact action. It preserves form inputs and returns focus to its trigger when closed.
- Session interruption is triggered by a named JSON scenario; the demo-session owner provides the reauthentication and recovery transitions. Preserve recoverable local work. A production adaptation would supply its actual session policy; no live authentication backend or hard-coded JWT countdown is needed for the template.

## Global state ownership

| State | Owner and observable result |
| --- | --- |
| Theme | A single theme owner resolves preset, light/dark/system mode and preference persistence; all shells render the same result |
| Loading | The owner of the pending work indicates it; skeletons approximate final geometry; persistent content remains visible during background refresh |
| Empty | The feature distinguishes first use, no matches, no access and unavailable data; its action resolves that specific situation |
| Feedback | Inline confirmation/error near the operation; a toast only supplements it when useful; no fabricated undo |
| Navigation | Router drives pending UI, document title and focus/scroll restoration; an optional progress bar is indeterminate, not a fake percentage |
| Connectivity | Request/service evidence determines whether work is affected; browser online state is a hint; drafts remain available |
| New deployment | Update owner offers reload when safe, preserving dirty work; an incompatible server contract requires a concrete recovery path |
| Fatal or access error | Nearest appropriate boundary keeps usable navigation and provides retry, sign-in, change-workspace or return actions as relevant |

## Shared acceptance

Shell behavior is specified once and exercised across one public, one app and one settings route. Test actual overlay focus restoration, keyboard operation and narrow-screen interactions. Theme previews must include portalled menus and dialogs. No floating toolbar, toast, consent banner or mobile navigation may hide the active field or required action. See the [quality contract](quality.md) for standards and the [UX decision register](ux-decisions.md) for deliberate departures from the input recipes.

## Implemented workspace Help and shortcuts

One sidebar Help control opens contextual guides through compact disclosure, with Help center, Contact and Keyboard shortcuts available in the same dialog. Public guide links use host routing. This implements NAV-06; chat and personalized support are not simulated.

`Ctrl/⌘ K` opens project search, `?` opens shortcut discovery and `Esc` is handled by the active overlay. Typing, IME composition and existing modal/popover/menu interactions keep ownership of their keys. Pointer controls remain available for all commands. Shortcut discovery lists only implemented commands (SYS-05); custom bindings and navigation key sequences remain deferred.

Once something is typed, project search offers "Search everything for …" first, so Enter opens `/app/demo/search` (SYS-10); matching projects stay one arrow key away. The results page groups projects, tasks, comments, messages and people (`src/demo/workspace-search.ts`: every word must match, title matches first) and help guides, shows five per group until a type is chosen, marks matched words, and links each result to its record; comments open at the comment. `q` and `type` live in the URL (typing replaces the entry, choosing a type adds one), the breadcrumb reads Search, and a project opened from results returns to them. Returning to Overview from a project now keeps a custom date range as well as the preset.

The sidebar identity row is a workspace menu (NAV-03, kit `WorkspaceSwitcher`, enabled by passing `switcher` in the shell's `workspace`). It lists the current workspace (marked, with its plan) and Create a workspace, which starts sign-up and onboarding. The demo holds one workspace's data at a time: after onboarding the menu also lists the Studio North sample, and choosing it asks for confirmation ("Stay in …" is focused) because switching restores the sample and discards the created workspace; confirming resets the demo and opens Overview. Escape closes the menu and returns focus to the row, also inside the phone navigation sheet.
