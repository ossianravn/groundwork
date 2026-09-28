# Contributing

Thanks for helping improve the template. Issues and pull requests are welcome; for a larger change, open an issue first so the scope can be agreed before you build it.

## Setup

Use Node.js 24 and npm 11.

```sh
npm ci
npm run dev
```

## What a change should respect

- **The kit stays independent.** Code in `src/kit/` must not import demo routes, features, fixtures, Forma components or the router. Shells receive brand, navigation and links from the host.
- **Primitives style themselves.** A shadcn primitive's appearance lives in its component, expressed with tokens. Kit stylesheets hold tokens, shells and patterns, not global overrides of primitives.
- **Tokens have one home.** Token values are defined only in `src/kit/styles/theme.css`; `responsive.css` may reassign them by media query. The shadcn CLI writes generated tokens into `kit.css`: move them.
- **Examples demonstrate workflows.** Every demo addition should show a coherent user task, with its meaningful states, rather than an isolated component.
- **Files stay small.** Keep new or enlarged hand-written code files at 300 lines or fewer, splitting by responsibility.

The [design system](docs/design-system.md), [UX decisions](docs/ux-decisions.md) and [quality contract](docs/quality.md) explain these rules. [AGENTS.md](AGENTS.md) holds the full working method, written for coding agents but useful to anyone.

## Before opening a pull request

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run format:check
```

For visual or interaction changes, check the affected pages at a wide and a narrow width, in light and dark appearance and both densities where they matter. For refactors that should not change appearance, the [style snapshot](tools/verification/README.md#style-snapshot) compares computed styles before and after.

Describe the behavior you changed and the checks you ran, so a reviewer who has not followed the discussion can verify it.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
