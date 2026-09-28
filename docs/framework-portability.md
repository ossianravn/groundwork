# Framework portability

Status: adopted for the first UI iteration on 2026-09-24. The demo uses React/TypeScript, Vite and TanStack Router. Reusable views remain separate from the host; cross-framework integrations are not yet verified.

## Recommended direction

Build reusable UI and page compositions with ordinary React and TypeScript, shadcn components, and shared Tailwind/CSS tokens. Keep routing, rendering entry points and deployment setup in the application that hosts the demo. Static JSON is the confirmed data source.

Vite is the demo build/development tool, with TanStack Router for navigation. Router hooks and route declarations live in `src/app/`; the overview, shell and shared UI receive ordinary data and callbacks. Do not build a custom router or three separate maintained demo applications to claim neutrality.

“Vanilla” here means ordinary React with limited framework coupling. shadcn's React components already establish a React dependency; the reusable output is not raw framework-free HTML/JavaScript or automatically usable in Vue/Svelte.

## Terms

| Name | Role |
| --- | --- |
| React | UI component library; not a complete routing/build setup |
| shadcn/ui | UI components and composition conventions used by the template |
| Vite | Development/build tooling; routing is a separate choice |
| Next.js | React application framework with its own routing and rendering model |
| TanStack Router | Routing library, usable for a React demo without the full Start framework |
| TanStack Start | React application framework built on TanStack Router; adds capabilities such as server rendering and server functions |

References: [React](https://react.dev/), [Vite](https://vite.dev/guide/), [Next.js](https://nextjs.org/docs), [TanStack Router](https://tanstack.com/router/latest/docs/overview), [TanStack Start](https://tanstack.com/start/latest/docs/framework/react/overview).

## Ownership boundaries

| Reusable template owns | Demo host owns |
| --- | --- |
| Semantic tokens, primitives, shared patterns and page layouts | Application entry points, router configuration and route files |
| Page-view props, domain shapes and user-action callbacks | Reading/writing URL parameters and navigating after actions |
| Navigation layout and labelled destinations | Router-specific Link elements, active-route matching and navigation behavior |
| Forms, tables, charts and their meaningful UI states | Binding those components to the demo's JSON data/state owner |
| Theme token contract and theme controls | Initial theme resolution, persistence integration and any server-rendering setup |
| Content/media data and ordinary display components | Framework-specific metadata, image/font loading and public-page rendering |

Route owners decode URL state into normal values such as filters, sorting and selected record ID. Reusable views receive those values and report changes through callbacks. They do not reach directly into Next navigation hooks or TanStack route context. Preserve normal links, open-in-new-tab behavior, browser Back and scroll/focus restoration when supplying router-specific navigation.

Compose existing link/slot mechanisms at the navigation boundary. Do not wrap every component in a speculative universal-framework API. Split a module only when it has a clear responsibility, and follow the 300-line code limit.

Keep Next-specific imports, server actions, route handlers, server-only modules, environment access and filesystem reads outside reusable UI. Likewise, keep TanStack Start server functions and router-specific loaders outside it. A template adopter may use those features when connecting the same components to their own application.

## What migration would involve

| Move | Expected reusable work | Host-specific work |
| --- | --- | --- |
| Vite demo to TanStack Start | Components, tokens, page views, record shapes and JSON fixtures | Start entry points/rendering, route setup and data binding; existing TanStack Router choices may reduce route conversion work |
| Vite demo to Next.js | Same reusable layer | Next route/layout files, client-component entry boundaries, navigation adapters, metadata/assets and initial theme handling |
| Next-hosted demo to React/Vite | Ordinary React components and shared styles, if kept isolated | Replace Next routing, Link/image/font integration and app setup; replace any Next server-dependent data flow |

This is an architectural estimate, not a tested compatibility claim. Next-to-Vite can be straightforward for isolated React components and substantial for pages coupled to Server Components, server actions or Next data APIs. JSON alone does not remove those dependencies. Next's server/client component boundaries also affect where callbacks and browser state can live. [Next server and client components](https://nextjs.org/docs/app/getting-started/server-and-client-components)

Both Next and Vite have official shadcn installation paths; choosing one does not make individual shadcn components exclusive to it. [shadcn with Vite](https://ui.shadcn.com/docs/installation/vite), [shadcn with Next](https://ui.shadcn.com/docs/installation/next)

## Packaging and acceptance

Start with clear source folders in one repository. Reuse should not depend on publishing a package, adopting a monorepo or installing a runtime compatibility layer. Document required UI dependencies and style setup so adopters can copy cohesive patterns or use a package later if justified.

The default demo must work with its chosen real router. A plain Vite client-rendered setup does not itself define public-page prerendering, SEO metadata or production deep-link handling; those remain explicit host responsibilities. Next static export likewise needs an appropriate plan for dynamic URLs, including newly created demo records.

When implementing, first verify one nontrivial page view with data/action props outside the demo's router context. Before claiming compatibility with another host, verify that view in that host, including theme styles, a portalled overlay and the applicable client/server boundary. Do not advertise a framework integration solely because there are no framework imports.

See [demo data](demo-data.md) and [styling architecture](design-system.md) for the shared contracts. The goal is to concentrate migration work in the host, not promise zero migration work.
