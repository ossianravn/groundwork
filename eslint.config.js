import js from "@eslint/js"
import tseslint from "typescript-eslint"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import globals from "globals"

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".artifacts/**",
      "tools/oxlint/anti-slop/**",
      ".dev-docs/**",
    ],
  },
  {
    files: ["tools/**/*.mjs"],
    extends: [js.configs.recommended],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
    ],
    languageOptions: { globals: globals.browser },
    plugins: { "react-refresh": reactRefresh },
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
          allowExportNames: ["buttonVariants", "badgeVariants", "router"],
        },
      ],
    },
  },
  {
    // The kit must be adoptable without the Forma demo or its router.
    files: ["src/kit/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@tanstack/react-router",
              message:
                "Kit components receive links and navigation from the host.",
            },
          ],
          patterns: [
            {
              regex:
                "^(@/|(\\.\\./)+)(app|features|demo|components|styles)(/|$)",
              message:
                "Kit code cannot depend on demo routes, features, fixtures, components or styles.",
            },
          ],
        },
      ],
    },
  },
)
