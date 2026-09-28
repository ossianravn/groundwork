import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs"
import { join, resolve } from "node:path"
import { createBrowser } from "./browser-driver.mjs"

// Records computed styles and geometry for representative routes and open
// states, then compares two recordings to show a reorganization is neutral.

const [command, ...names] = process.argv.slice(2)

const base = process.env.VERIFY_URL || "http://127.0.0.1:5173"

const output = resolve(
  process.env.VERIFY_ARTIFACT_DIR || ".artifacts/verification/style-snapshot",
)

const routes = [
  "/",
  "/product",
  "/pricing",
  "/blog",
  "/changelog",
  "/help",
  "/contact",
  "/privacy",
  "/auth/sign-in",
  "/auth/sign-up",
  "/onboarding/workspace",
  "/app/demo/overview",
  "/app/demo/projects",
  "/app/demo/projects?view=board",
  "/app/demo/projects/brand",
  "/app/demo/projects/brand/edit",
  "/app/demo/inbox",
  "/app/demo/analytics",
  "/app/demo/activity",
  "/app/demo/settings/profile",
  "/app/demo/settings/appearance",
  "/app/demo/settings/team",
  "/app/demo/settings/billing",
  "/app/demo/settings/webhooks",
  "/reference",
  "/reference/components",
  "/reference/patterns",
  "/reference/themes",
  "/reference/states",
]

// Open overlays and popups, reached by one agent-browser action each. An
// action unavailable at a width (for example a hidden trigger) is skipped.
const states = [
  ["search", "/app/demo/overview", "click", ".search-trigger"],
  ["appearance", "/app/demo/overview", "click", ".appearance-trigger"],
  ["project-sheet", "/app/demo/projects?inspect=brand"],
  ["compose", "/app/demo/inbox", "click", 'button[aria-label="New message"]'],
  [
    "owner-filter",
    "/app/demo/projects",
    "find",
    "role",
    "button",
    "click",
    "--name",
    "Owner",
  ],
  [
    "font-select",
    "/app/demo/settings/appearance",
    "click",
    '[data-slot="select-trigger"]',
  ],
  [
    "tag-combobox",
    "/app/demo/projects/brand/edit",
    "click",
    '[data-slot="combobox-chip-input"]',
  ],
  [
    "invite",
    "/app/demo/settings/team",
    "find",
    "role",
    "button",
    "click",
    "--name",
    "Invite member",
  ],
  [
    "rename",
    "/reference/components/dialog",
    "find",
    "role",
    "button",
    "click",
    "--name",
    "Rename",
  ],
]

const settings = [
  { id: "light-comfortable-1440", width: 1440, height: 900, theme: {} },
  {
    id: "dark-compact-neutral-390",
    width: 390,
    height: 844,
    theme: { appearance: "dark", density: "compact", accent: "neutral" },
  },
]

const properties = [
  "display",
  "position",
  "font-family",
  "font-size",
  "font-weight",
  "line-height",
  "color",
  "background-color",
  "border-top-width",
  "border-top-color",
  "border-bottom-width",
  "border-left-width",
  "border-radius",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin-top",
  "margin-bottom",
  "gap",
  "grid-template-columns",
  "flex-direction",
  "align-items",
  "justify-content",
  "opacity",
  "box-shadow",
  "overflow-x",
  "overflow-y",
  "text-align",
  "visibility",
  "z-index",
]

function snapshotPage(watched) {
  const rows = []

  const path = (element) => {
    const parts = []

    for (let node = element; node && node !== document.body;) {
      const parent = node.parentElement
      const index = parent ? [...parent.children].indexOf(node) : 0

      parts.unshift(`${node.tagName.toLowerCase()}:${index}`)
      node = parent
    }

    return parts.join("/")
  }

  for (const element of document.body.querySelectorAll("*")) {
    if (/^(SCRIPT|STYLE|LINK|META|TEMPLATE)$/.test(element.tagName)) continue

    const style = getComputedStyle(element)
    const box = element.getBoundingClientRect()
    const values = watched.map((name) => style.getPropertyValue(name))
    const geometry = [box.x, box.y, box.width, box.height].map(Math.round)

    rows.push([path(element), [...geometry, ...values].join("|")])
  }

  return rows
}

function capture(name) {
  const browser = createBrowser()
  const directory = join(output, name)

  mkdirSync(directory, { recursive: true })

  try {
    for (const setting of settings) {
      browser("set", "viewport", String(setting.width), String(setting.height))
      browser("open", base)
      browser(
        "eval",
        "--stdin",
        `localStorage.setItem("groundwork.theme.v1", ${JSON.stringify(
          JSON.stringify(setting.theme),
        )})`,
      )

      const pages = [
        ...routes.map((route) => [route.replace(/[/?=]+/g, "_"), route]),
        ...states.map(([id, ...rest]) => [`_state_${id}`, ...rest]),
      ]

      for (const [id, route, ...action] of pages) {
        browser("open", base + route)
        browser("wait", "900")

        if (action.length) {
          try {
            browser(...action)
            // Park the pointer so the trigger's hover state is not recorded.
            browser(
              "mouse",
              "move",
              String(setting.width - 2),
              String(setting.height - 2),
            )
            browser("wait", "700")
          } catch {
            console.log(`${setting.id} ${id}: action unavailable, skipped`)
            continue
          }
        }

        const rows = browser(
          "eval",
          "--stdin",
          `(${snapshotPage.toString()})(${JSON.stringify(properties)})`,
        ).result

        writeFileSync(
          join(directory, `${setting.id}${id}.json`),
          JSON.stringify(rows),
        )
        console.log(`${setting.id} ${id}: ${rows.length} elements`)
      }
    }
  } finally {
    browser("close")
  }
}

function compare(before, after) {
  let changedPages = 0

  for (const file of readdirSync(join(output, before))) {
    if (!existsSync(join(output, after, file))) {
      changedPages += 1
      console.log(`\n${file}: not captured in ${after}`)
      continue
    }

    const read = (name) =>
      new Map(JSON.parse(readFileSync(join(output, name, file), "utf8")))

    const a = read(before)
    const b = read(after)
    const differences = []

    for (const [key, value] of a) {
      if (!b.has(key)) differences.push(`removed ${key}`)
      else if (b.get(key) !== value) {
        const left = value.split("|")
        const right = b.get(key).split("|")
        const labels = ["x", "y", "width", "height", ...properties]

        const changed = labels.flatMap((label, i) =>
          left[i] === right[i] ? [] : [`${label}: ${left[i]} → ${right[i]}`],
        )

        differences.push(`${key}\n      ${changed.join("\n      ")}`)
      }
    }

    for (const key of b.keys())
      if (!a.has(key)) differences.push(`added ${key}`)

    if (!differences.length) continue

    changedPages += 1
    console.log(`\n${file}: ${differences.length} differing elements`)

    for (const line of differences.slice(0, 8)) console.log(`  ${line}`)
  }

  console.log(
    changedPages
      ? `\n${changedPages} page settings differ.`
      : "\nNo computed-style or geometry differences.",
  )
  process.exitCode = changedPages ? 1 : 0
}

if (command === "capture" && names[0]) capture(names[0])
else if (command === "compare" && names[1]) compare(names[0], names[1])
else {
  console.error(
    "Usage: style-snapshot.mjs capture <name> | compare <before> <after>",
  )
  process.exitCode = 2
}
