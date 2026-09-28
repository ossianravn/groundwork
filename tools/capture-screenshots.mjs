import { resolve } from "node:path"
import { createBrowser } from "./verification/browser-driver.mjs"

// Recaptures the product screenshots used by the public pages, blog articles
// and README. Run with the dev server on port 5173; captures use the default
// appearance and fresh demo data, so they are repeatable.

const base = process.env.VERIFY_URL || "http://127.0.0.1:5173"

const shots = [
  ["tandem-overview", "/app/demo/overview"],
  ["tandem-board", "/app/demo/projects?view=board"],
  ["tandem-project", "/app/demo/projects/brand"],
]

// Hide native scrollbars, as marketing captures should not show them.
const browser = createBrowser("hidden-scrollbars")

try {
  browser("set", "viewport", "1280", "860")
  browser("open", base)
  browser("eval", "--stdin", 'localStorage.removeItem("groundwork.theme.v1")')

  for (const [name, route] of shots) {
    const file = resolve("public/images", `${name}.png`)

    browser("open", base + route)
    browser("wait", "1500")
    browser("mouse", "move", "1279", "859")
    browser("screenshot", file)
    console.log(`${route} -> public/images/${name}.png`)
  }
} finally {
  browser("close")
}
