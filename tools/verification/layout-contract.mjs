import { mkdirSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { createBrowser } from "./browser-driver.mjs"
import { layoutProbe } from "./layout-probe.mjs"

// The layout contract: renders each workspace route at desktop and phone
// widths and checks the page anatomy in docs/design-system.md. Shell rules
// (no sideways scroll, the sidebar brand on the top bar's axis) hold
// everywhere. Page rules (inset, zone gaps, the content edge, one control
// height per toolbar, the type ramp) apply to pages that mark their zones
// with data-page-zone; the others are listed as pending.
//
//   node tools/verification/layout-contract.mjs [route-filter]

const base = process.env.VERIFY_URL || "http://127.0.0.1:5173"

const output = resolve(
  process.env.VERIFY_ARTIFACT_DIR || ".artifacts/verification/layout-contract",
)

const routes = [
  "/app/demo/overview",
  "/app/demo/projects",
  "/app/demo/projects?view=grid",
  "/app/demo/projects?view=board",
  "/app/demo/projects?view=timeline",
  "/app/demo/projects/brand",
  "/app/demo/projects/brand?tab=comments",
  "/app/demo/projects/brand?tab=activity",
  "/app/demo/projects/brand?tab=agent",
  "/app/demo/projects/onboarding",
  "/app/demo/projects/import",
  "/app/demo/inbox",
  "/app/demo/assistant",
  "/app/demo/analytics",
  "/app/demo/activity",
  "/app/demo/search?q=brand",
  "/app/demo/settings/profile",
  "/app/demo/settings/appearance",
  "/app/demo/settings/notifications",
  "/app/demo/settings/workspace",
  "/app/demo/settings/team",
  "/app/demo/settings/security",
  "/app/demo/settings/api-keys",
  "/app/demo/settings/webhooks",
  "/app/demo/settings/billing",
  "/app/demo/settings/assistant",
]

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "phone", width: 390, height: 844 },
]

const filter = process.argv[2]

const browser = createBrowser()

const results = []

try {
  for (const viewport of viewports) {
    browser("set", "viewport", String(viewport.width), String(viewport.height))

    for (const route of routes.filter(
      (item) => !filter || item.includes(filter),
    )) {
      browser("open", base + route)
      browser("wait", "1200")

      const data = browser(
        "eval",
        "--stdin",
        `(${layoutProbe.toString()})()`,
      )?.result

      results.push({ route, viewport: viewport.name, ...data })
    }
  }
} finally {
  browser("close")
}

mkdirSync(output, { recursive: true })

writeFileSync(join(output, "report.json"), JSON.stringify(results, null, 1))

const failing = results.filter((item) => item.issues.length)

const pending = results.filter((item) => !item.zones)

for (const item of failing) {
  console.log(`✗ ${item.viewport} ${item.route}`)

  for (const issue of item.issues) console.log(`    ${issue}`)
}

console.log(
  `layout contract: ${results.length - failing.length}/${results.length} pass; ${pending.length} without page zones (page rules pending).`,
)

process.exitCode = failing.length ? 1 : 0
