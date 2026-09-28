# Awesome Template Spec Details

## Description
A table containing more info about the various specs.

### Component & UX Pattern Specification

#### 1. System Foundations & Global Chrome
| ID | Element / Pattern | Target Surface | Shadcn Primitives & Libs | Golden UX / UI Rule (The "Anti-Wheel" Standard) | Mandatory States & Edge Cases |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SYS-01** | Theme Provider & Toggle | Both | `DropdownMenu`, `Button`, `next-themes` | Zero flash on page load (SSR safe); respects OS preference by default; keyboard accessible. | Light, Dark, System, High-contrast (optional). |
| **SYS-02** | Global Command Menu (`Cmd+K`) | Both (Contextual) | `Command` (cmdk), `Dialog`, `Badge` | Group results by category (Pages, Actions, Records); instant keyboard navigation (`↑`/`↓`/`Enter`); recent searches memory. | Open/Closed, Empty ("No results"), Loading, Scoped search (e.g. searching only within a workspace). |
| **SYS-03** | Toast Notification System | Both | `Sonner` | Limit to 3 stacked toasts max; always provide actionable "Undo" buttons for destructive/reversible triggers; never block critical UI. | Success, Error (with copyable error code), Warning, Loading/Promise, Dismissed. |
| **SYS-04** | Notification Drawer / Popover | Backend | `Popover` / `Sheet`, `Tabs`, `ScrollArea`, `Badge` | Group by "Unread" vs "All"; support "Mark all as read"; link directly to the underlying record. | Empty ("All caught up"), Unread indicators, Paginated scroll, Notification permission prompt. |
| **SYS-05** | Keyboard Shortcut Overlay (`?`) | Backend | `Dialog`, `Kbd` primitive, `Table` | Pressing `?` anywhere outside of an input opens a modal showing global, navigation, and page-specific shortcuts. | Categorized groups, platform-specific keys (`⌘` for macOS vs `Ctrl` for Windows). |
| **SYS-06** | Skip to Content Anchor | Both | Radix focus primitive, Tailwind utilities | Hidden until focused via `Tab`; must instantly jump focus past navbars to the `<main id="content">`. | Hidden, Focused/Visible. |

---

#### 2. Public / Marketing ("The Frontend")
| ID | Element / Pattern | Target Surface | Shadcn Primitives & Libs | Golden UX / UI Rule (The "Anti-Wheel" Standard) | Mandatory States & Edge Cases |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **MKT-01** | Sticky Glassmorphism Header | Public | `NavigationMenu`, `Button`, `Sheet` | Dynamic blur on scroll; mobile drawer replaces menu at `<md`; auth-aware CTAs ("Go to Dashboard" if session exists). | Scrolled vs Top, Guest vs Authenticated, Mobile drawer open/closed. |
| **MKT-02** | Hero Section (Split & Centered) | Public | `Badge`, `Button`, `AspectRatio` | Clear H1 with value proposition; primary CTA with high contrast; secondary CTA (e.g., "Live Demo"); social proof micro-badge. | Interactive live demo preview, Video modal trigger, Responsive sizing. |
| **MKT-03** | Infinite Logo Marquee | Public | Framer Motion / CSS keyframes, `Tooltip` | Must pause on hover and obey `prefers-reduced-motion`; monochrome logos with subtle hover opacity change. | Running, Paused (hover/focus), Dark/Light variant logos. |
| **MKT-04** | Bento Grid Feature Showcase | Public | `Card`, `Badge`, Lucide Icons | Asymmetric layout showing real UI snippets, not generic stock illustrations; subtle hover glow/border transition. | Responsive stack (`1 col` mobile → `3 col` desktop), Hover interactions. |
| **MKT-05** | Interactive Product Showcase Tabs | Public | `Tabs`, `AspectRatio`, `Card` | Tab triggers on the left change high-resolution UI previews on the right; autoplays with progress bar until user interacts. | Auto-cycling, Paused on user click, Active indicator bar. |
| **MKT-06** | Testimonial Wall / Grid | Public | `Card`, `Avatar`, `Badge` | Real customer avatars, names, titles, and verified company chips; optional toggle between quotes and video snippets. | Masonry grid or carousel, Hover state, Read more truncation. |
| **MKT-07** | Pricing Matrix & Toggle | Public | `Card`, `Switch` / `Tabs`, `Badge`, `Button`, `Tooltip` | Monthly vs Annual billing toggle with savings badge ("Save 20%"); visually highlight "Most Popular"; no hidden fees. | Monthly active, Annual active, Currency selector (optional), Enterprise custom tier. |
| **MKT-08** | Detailed Feature Comparison Table | Public | `Table`, `Tooltip`, `Check`, `Minus` icons | Sticky header row when scrolling down; feature categories with expandable rows; tooltips explaining complex features. | Scrolled sticky state, Expanded/Collapsed sections, Mobile card fallback. |
| **MKT-09** | Searchable FAQ Accordion | Public | `Accordion`, `Input` | Deep-linkable accordion items (URL hash `#faq-billing`); search input to filter questions if count > 8. | Collapsed, Expanded, Filtered/Empty ("No matching questions"). |
| **MKT-10** | Newsletter / Lead Capture | Public | `Input`, `Button`, React Hook Form + Zod | Inline validation; instant success state replacing form without page reload; prevents double submission. | Idle, Validating, Submitting, Success message, Error/Rate-limited. |
| **MKT-11** | Multi-column Global Footer | Public | `Separator`, `Badge`, `Button` | Categorized links, newsletter form, system status pill (green/yellow ping dot), copyright, language selector. | Responsive accordion stack on mobile. |
| **MKT-12** | Cookie Consent Banner | Public | `Card` / `Sheet`, `Switch`, `Button` | Non-blocking bottom banner; granular consent toggles (Necessary, Analytics, Marketing); easily revocable from footer. | First visit, Expanded preferences modal, Dismissed/Saved. |
| **MKT-13** | Blog / Prose Typography Layout | Public | `@tailwindcss/typography`, `ScrollArea` | Highly readable max-width (`prose`); auto-generated sticky Table of Contents; copyable code blocks. | Standard prose, Image with caption, Blockquote, Mobile TOC collapsed. |
| **MKT-14** | Contact Sales / Inbound Form | Public | `Form`, `Select`, `Textarea` | Must include honeypot/invisible CAPTCHA to prevent spam; auto-expands textarea as user types; clear routing subject. | Idle, Validating, Submitting, Success state (replaces form), Rate-limited. |
| **MKT-15** | Changelog / Release Notes | Public | `Badge`, `Separator`, `Card` | Reverse-chronological timeline; visual tags for feature/bug/improvement; deep-linkable version hashes. | Single release view, Infinite scroll / Paginated history. |
---

#### 3. Authentication & Onboarding (The Bridge)
| ID | Element / Pattern | Target Surface | Shadcn Primitives & Libs | Golden UX / UI Rule (The "Anti-Wheel" Standard) | Mandatory States & Edge Cases |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **AUTH-01** | Unified Auth Form (Sign In / Up) | Both | `Card`, `Form`, `Input`, `Button`, `Separator` | Split-screen branding or clean centered card; email/password + OAuth buttons; clear password visibility toggle. | Idle, Loading/Submitting, Validation errors (field & server level), Disabled. |
| **AUTH-02** | Social / OAuth Provider Buttons | Both | `Button` (outline), SVG Icons (Google, GitHub) | Visually consistent branding; disables sibling buttons when one is clicked to prevent concurrent auth flows. | Idle, Selected/Loading spinner, Provider service error fallback. |
| **AUTH-03** | Passwordless Magic Link Flow | Both | `Card`, `Input`, `Button`, Animated Mail Icon | Replaces form with "Check your inbox" card upon submit; resend countdown timer (60s) to prevent spamming. | Awaiting submission, Email sent, Resend cooldown timer, Invalid/expired token. |
| **AUTH-04** | 2FA / TOTP 6-Digit Input | Both | `InputOTP`, `InputOTPGroup`, `InputOTPSlot` | Auto-advances focus to next digit; auto-submits on completion of 6th digit; full clipboard paste support. | Blank, Focused slot, Invalid code error shake, Loading/Verifying. |
| **AUTH-05** | Multi-Step Onboarding Stepper | Backend | `Progress`, `Button`, `Card` | Indicates current step (e.g., Step 2 of 4); persists completed steps in DB/session; allows skipping non-essential steps. | Active step, Completed step with checkmark, Unsaved state warning. |
| **AUTH-06** | Workspace Setup Wizard | Backend | `Form`, `Input`, `Avatar`, `Button` | Real-time workspace slug availability checker with debounced API check; auto-suggests URL slug from workspace name. | Checking slug availability, Slug taken, Slug valid, Avatar uploaded. |
| **AUTH-07** | Password Reset / Recovery Flow | Both | `Form`, `Input`, `Button` | Never reveal if an email exists (security); link expires quickly; enforces password strength on reset. | Email sent (generic success), Token invalid/expired, Password reset success. |
| **AUTH-08** | Inactivity / Session Expiry Modal | Backend | `AlertDialog`, `Progress` | Warns user 60 seconds before JWT/session expiry; offers 1-click "Keep me signed in" to refresh token. | Warning countdown active, Session expired (forces redirect to login). |

---

#### 4. App Shell & Navigation ("The Backend")
| ID | Element / Pattern | Target Surface | Shadcn Primitives & Libs | Golden UX / UI Rule (The "Anti-Wheel" Standard) | Mandatory States & Edge Cases |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NAV-01** | Collapsible Sidebar (Multi-Level) | Backend | `Sidebar` (shadcn), `Tooltip`, `Collapsible`, `Badge` | Three states: Expanded, Icon-only Mini, and Mobile Sheet; state persists across reloads (`cookie`/`localStorage`). | Expanded, Collapsed mini, Sub-menu open, Active route highlight, Badges. |
| **NAV-02** | Breadcrumb Trail with Dropdowns | Backend | `Breadcrumb`, `DropdownMenu` | Auto-truncates middle steps on small screens (`Home > ... > Settings`); dropdown allows jumping sideways to sibling pages. | Truncated, Full, Dropdown active. |
| **NAV-03** | Workspace / Tenant Switcher | Backend | `Popover` / `Select`, `Avatar`, `Command` | Shows current workspace; searchable list of organizations; instant "+ Create New Workspace" modal trigger. | Single org, Multi-org list, Switching/loading state, Personal vs Team tag. |
| **NAV-04** | User Profile Menu Dropdown | Backend | `DropdownMenu`, `Avatar`, `Badge` | Displays name, email, and current role badge; quick links to Profile, Billing, Theme toggle, and Sign Out. | Open, Closed, Session expired fallback. |
| **NAV-05** | Global App Top Bar | Backend | `Button`, `Breadcrumb`, `Separator` | Sticky top; houses sidebar trigger toggle, breadcrumbs, search shortcut button (`Cmd+K`), notification bell, and user avatar. | Scrolled with border, Mobile layout with hamburger. |
| **NAV-06** | Contextual Help & Support Widget | Backend | `Sheet` / `Popover`, `Accordion`, `Input` | Floating `?` or menu item opens support docs *without* leaving the page; integrated "Contact Support" fallback. | Searching docs, Reading article, Support ticket form open. |
| **NAV-07** | Mobile Bottom Tab Navigation | Backend | `NavigationMenu`, Icons | (For PWA/Mobile web) Sticky bottom bar replacing sidebar for top 4-5 routes; disappears on scroll down, appears on scroll up. | Active route, Inactive route, Badge indicator (e.g., unread alerts). |

---

#### 5. Data Visualization & Analytics
| ID | Element / Pattern | Target Surface | Shadcn Primitives & Libs | Golden UX / UI Rule (The "Anti-Wheel" Standard) | Mandatory States & Edge Cases |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DVIZ-01** | Metric Stat Card (KPI) | Backend | `Card`, `Badge`, Recharts sparkline | Large legible metric; percentage delta badge (green for +%, red for -%); contextual period label ("vs last 30 days"); sparkline. | Positive trend, Negative trend, Neutral trend, Loading skeleton. |
| **DVIZ-02** | Area / Line Time-Series Chart | Backend | `Chart` (shadcn), Recharts, `Card`, `Tabs` | Interactive hover crosshairs; customized tooltips with formatted currency/units; date range toggle (7d, 30d, 90d, 1y). | Empty (no data in range), Loading skeleton, Data spike / anomaly tooltip. |
| **DVIZ-03** | Segmented Bar Chart | Backend | `Chart` (shadcn), Recharts, `Card` | Stacked or grouped bars; interactive legends that click to toggle series visibility; custom formatters on axes. | Single series, Multi-series, Legend hidden, Responsive bar thickness. |
| **DVIZ-04** | Donut / Breakdown Chart | Backend | `Chart` (shadcn), Recharts, `Card` | Displays total summary in the center cutout; hover highlights specific slice; clean side-legend with percentages. | Empty slice, Hovered slice highlight, Legend wrapping on mobile. |
| **DVIZ-05** | Date Range & Filter Picker | Backend | `Popover`, `Calendar`, `Button`, `Select` | Quick presets ("Today", "Yesterday", "Last 7 days", "This Month", "Custom Range"); calendar bounds validation. | Preset active, Custom range active, Open calendar popover. |

---

#### 6. Advanced Data Tables & Record Manipulation
| ID | Element / Pattern | Target Surface | Shadcn Primitives & Libs | Golden UX / UI Rule (The "Anti-Wheel" Standard) | Mandatory States & Edge Cases |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TABL-01** | Standard App Data Table | Backend | `Table`, `@tanstack/react-table`, `Checkbox` | URL-synchronized query parameters (`?page=2&sort=created_at:desc&status=active`); row selection checkboxes; sticky column headers. | Empty, Loading (table skeleton), Row selected, Filtered, All rows selected. |
| **TABL-02** | Faceted Filter Toolbar | Backend | `Popover`, `Command`, `Badge`, `Button` | Multi-select badge chips with item counts; search within filter options; clear all filters button only visible when dirty. | Filter applied, Multiple filters stacked, No matches inside search, Clear all. |
| **TABL-03** | Column Visibility & Reorder Menu | Backend | `DropdownMenu`, `DropdownMenuCheckboxItem` | Let users hide/show columns; choices persist in `localStorage` or user profile DB. | Default columns, Hidden columns, Reset to default. |
| **TABL-04** | Floating Bulk Action Bar | Backend | `Card` / `motion.div`, `Button`, `Separator` | Appears floating at screen bottom only when ≥ 1 row is selected; shows selected count; actions (Bulk Delete, Export, Tag). | Hidden (0 rows), Active (N rows), Indeterminate header checkbox state. |
| **TABL-05** | Pagination & Page-Size Controls | Backend | `Pagination`, `Select`, `Button` | Displays "Showing 1–25 of 1,240 results"; page size selector (10, 25, 50, 100); next/prev buttons with keyboard arrows. | First page (Prev disabled), Last page (Next disabled), Single page only. |
| **TABL-06** | Slide-Over Inspection Drawer | Backend | `Sheet`, `Tabs`, `Separator`, `Button` | Opens record details on row click without losing table scroll or pagination state; editable fields right inside drawer. | Opening, Loaded record, Unsaved changes inside drawer, Closing confirm. |
| **TABL-07** | Split-Pane / Master-Detail View | Backend | `Resizable` (shadcn/react-resizable-panels) | Left list of records with status indicators; right detailed preview panel; draggable resize divider with collapse shortcut. | Left panel collapsed, Resized panel, No item selected placeholder. |
| **TABL-08** | Activity Feed & Audit Timeline | Backend | `ScrollArea`, `Avatar`, `Badge`, `Dialog` | Vertical connector line; user avatar, timestamp, action verb; "View Diff" modal showing JSON or field before/after changes. | Empty timeline, Collapsible older events, Diff viewer open. |
| **TABL-09** | Kanban / Pipeline Board | Backend | `dnd-kit`, `ScrollArea`, `Card` | Draggable cards with visual drop indicators; smooth scrolling when dragging near edges; preserves state on drop. | Dragging active, Dropped (optimistic UI), Empty column, Loading. |
| **TABL-10** | View Toggle (List vs Grid) | Backend | `ToggleGroup`, `Card`, `Table` | Instantly switch between dense table and visual grid cards; preference saved in `localStorage`. | Grid view active, List view active, Skeleton grid vs Skeleton table. |
| **TABL-11** | Advanced Query Builder | Backend | `Select`, `Input`, `Button`, `Badge` | Construct complex filters (`WHERE Status = Active AND Amount > 100`); add/remove rule rows dynamically. | Single rule, Grouped rules (AND/OR), Invalid rule warning. |

---

#### 7. Settings, Workspace & CRUD Forms
| ID | Element / Pattern | Target Surface | Shadcn Primitives & Libs | Golden UX / UI Rule (The "Anti-Wheel" Standard) | Mandatory States & Edge Cases |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SETT-01** | Vertical Tab Settings Layout | Backend | `Tabs` (vertical), `Card`, `Separator` | Consistent sub-navigation (General, Team, Billing, Security, API); sticky title and description header for each section. | Active tab, Tab with unsaved badge, Mobile stacked select fallback. |
| **SETT-02** | Floating Unsaved Changes Warning | Both | `motion.div`, `Card`, `Button` | Floats at bottom if form is dirty; warns before navigating away (browser navigation intercept); supports `Cmd+S` save hotkey. | Clean (hidden), Dirty (visible), Saving/Spinning, Discard confirm. |
| **SETT-03** | Drag-and-Drop File / Avatar Uploader | Both | `Card`, `Input[type=file]`, `Progress`, `Avatar` | Dropzone with visual dragover state; client-side image crop modal before upload; file size & MIME type validation with friendly errors. | Idle, Dragging over, Uploading (with % progress bar), Error (file too large). |
| **SETT-04** | Team Members & RBAC Manager | Backend | `Table`, `Select`, `Dialog`, `Badge` | Member list with role select (Owner, Admin, Member, Viewer); prevents demoting the last Owner; instant remove member action. | Pending invitation chip, Active member, Role changed toast, Invite dialog. |
| **SETT-05** | Invite Member Dialog | Backend | `Dialog`, `Input`, `Select`, `Button` | Send email invites with pre-selected roles; copyable shareable invite link with 1-click clipboard copy and toast confirmation. | Idle, Sending, Link copied, Email invalid. |
| **SETT-06** | API Key Generator & Manager | Backend | `Table`, `Dialog`, `Input`, `Badge` | Generate key modal displays secret key **once** with a copy button; list displays masked key (`sk_live_...x9A2`), creation date, and last used date. | Secret revealed modal (unmasked), Revocation confirm dialog, Expired key badge. |
| **SETT-07** | Webhook Manager & Test Ping | Backend | `Card`, `Table`, `Dialog`, `Badge` | Endpoint list with status dot (Active/Failing); "Send Test Event" trigger; expandable logs showing payload and response code (200/500). | Test sending, Ping successful (200 OK), Ping failed (with response body). |
| **SETT-08** | Plan Usage Meter & Stripe Bridge | Backend | `Card`, `Progress`, `Button`, `Badge` | Usage bars (e.g., "7,400 / 10,000 monthly seats"); clear upgrade triggers; "Manage Subscription" button redirecting to Stripe Customer Portal. | Approaching limit (>85% yellow), Limit exceeded (red), Active plan tier badge. |
| **SETT-09** | Invoice History & PDF Download | Backend | `Table`, `Badge`, `Button` | Displays invoice date, amount, status chip (Paid, Void, Open); direct download link for PDF receipt. | Paid status, Past due status, PDF generating / downloading state. |
| **SETT-10** | Rich Text / Markdown Editor | Backend | `Tiptap` / Plate, `ToggleGroup` | Seamless WYSIWYG editing; sticky formatting toolbar; handles copy-paste from Word/Google Docs cleanly. | Focused, Empty placeholder, Text highlighted (toolbar appears). |
| **SETT-11** | Tag / Multi-select Input | Backend | `Command`, `Badge`, `Popover` | Type and press Enter to create tags; backspace to delete last tag; dropdown suggests existing tags. | Focused, Tag created, Max tags reached, Duplicate tag warning. |
| **SETT-12** | Dynamic Field Arrays | Backend | `Form`, `Button`, `Trash` icon | Add/remove rows dynamically (e.g., "Add another URL"); animate entry/exit to avoid layout snapping. | 1 row (delete disabled), N rows, Max rows limit reached. |


---

#### 8. Resilience, Edge States & Micro-UX
| ID | Element / Pattern | Target Surface | Shadcn Primitives & Libs | Golden UX / UI Rule (The "Anti-Wheel" Standard) | Mandatory States & Edge Cases |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **EDGE-01** | Content-Geometry Skeleton Loaders | Both | `Skeleton` | Must match the exact height, width, and layout of the loading component to prevent Cumulative Layout Shift (CLS). | Pulsing animation, Staggered row skeletons for tables. |
| **EDGE-02** | Zero-Data Empty States | Both | `Card`, Empty Illustration / Icon, `Button` | Contextual visual placeholder; clear explanation of why it's empty; direct CTA to create the first item or clear applied filters. | No records created yet, No results found matching search/filter criteria. |
| **EDGE-03** | Destructive Action Dialog (Guarded) | Both | `AlertDialog`, `Input`, `Button` (destructive) | For catastrophic actions (e.g. deleting a workspace); requires typing the exact resource name or confirmation phrase to enable Delete. | Input mismatch (Button disabled), Matched string (Button enabled), Deleting. |
| **EDGE-04** | Inline Click-to-Edit Field | Backend | `Input`, `Button`, `Check`, `X` | Text turns into an input on click; saves on `Enter` or `blur`; reverts on `Escape`; eliminates modal overhead for minor updates. | Read-only hover state, Editing active, Auto-saving indicator, Error revert. |
| **EDGE-05** | System Error Boundaries (404/403/500) | Both | `Card`, `Button`, Lucide Icons | Clear diagnostic error code; non-technical explanation; primary CTA to "Return to Dashboard" and secondary CTA to "Report Issue". | 404 Not Found, 403 Forbidden / Insufficient Permissions, 500 Crash with retry. |
| **EDGE-06** | Offline / Reconnecting Banner | Both | `motion.div`, `Badge`, `WifiOff` icon | Subtle, sticky, non-intrusive warning when `navigator.onLine === false`; auto-dismisses with a green "Back online" toast on reconnect. | Offline persistent bar, Reconnected transient banner. |
| **EDGE-07** | Button Loading State Geometry Lock | Both | `Button`, `Loader2` | When submitting, button shows spinner but **preserves its exact pixel width** to eliminate layout jitter/button bounce. | Idle, Hover, Submitting/Loading (width locked), Disabled. |
| **EDGE-08** | Route Loading Progress Bar | Both | `nextjs-toploader` / CSS | Slim top progress bar for SPA route changes; gives instant feedback when a link is clicked before the new page renders. | Fetching (animating to 90%), Complete (100% and fade out). |
| **EDGE-09** | App Update / Version Mismatch | Both | `Toast` or `motion.div` | Detects new deployment hash; prompts user to "Refresh to update" to prevent API/Frontend mismatch errors. | Update available (dismissible but persistent), Force reload required. |

---
