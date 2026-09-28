import { existsSync } from "node:fs"
import { spawnSync } from "node:child_process"

// The anti-slop Oxlint plugin is a maintainer-local tool and is not
// distributed with the template, so the check runs only where it is installed.
if (!existsSync(".oxlintrc.json") || !existsSync("tools/oxlint/anti-slop")) {
  console.log("anti-slop: not installed locally; skipped.")
  process.exit(0)
}

const result = spawnSync("oxlint", ["."], { stdio: "inherit", shell: true })

process.exit(result.status ?? 1)
