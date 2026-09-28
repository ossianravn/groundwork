import assert from "node:assert/strict"
import { createBrowser } from "./browser-driver.mjs"
import { mkdirSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"

const [scenario, fault] = process.argv.slice(2)

const browser = createBrowser(fault)

const output = resolve(
  process.env.VERIFY_ARTIFACT_DIR || ".artifacts/verification/browser",
)

const evidence = {
  scenario,
  fault: fault ?? null,
  observations: [],
  screenshots: [],
}

function evaluate(fn, ...args) {
  return browser(
    "eval",
    "--stdin",
    `(${fn.toString()})(...${JSON.stringify(args)})`,
  ).result
}

function capture(label) {
  evidence.screenshots.push(
    browser(
      "screenshot",
      join(output, `${scenario}-${label}.png`),
      ...(scenario === "controls" ? ["--full"] : []),
    ),
  )
}

function inject(css) {
  evaluate((text) => {
    const style = document.createElement("style")

    style.textContent = text
    document.head.append(style)
  }, css)
}

function controls() {
  for (const [density, expected] of [
    ["Comfortable", 36],
    ["Compact", 32],
  ]) {
    browser("click", ".appearance-trigger")
    browser("find", "role", "radio", "click", "--name", density)
    browser("press", "Escape")
    browser("wait", "250")

    if (fault === "small-control")
      inject(
        '[aria-label="Task completion period"] {height:28px!important;min-height:28px!important}',
      )

    const sizes = evaluate(() => {
      const field = document.querySelector('[aria-label="Search projects"]')

      const peers = [
        document.querySelector('[aria-label="Task completion period"]'),
        field.closest('[data-slot="input-group"]'),
        document.querySelector('[aria-label="Status: All"]'),
        document.querySelector('[aria-label="Owner: All"]'),
      ]

      return peers.map((element) => ({
        label: element.getAttribute("aria-label") || "Search group",
        height: element.getBoundingClientRect().height,
      }))
    })

    evidence.observations.push({ density, expected, sizes })
    capture(density)
    assert.ok(
      sizes.every((size) => Math.abs(size.height - expected) < 0.5),
      `Equivalent controls violate ${density} ${expected}px role: ${JSON.stringify(sizes)}`,
    )
  }
}

function scrollbar() {
  evaluate(() =>
    document
      .querySelector('[aria-label="Inspect Brand refresh"]')
      .scrollIntoView({ block: "center" }),
  )
  browser("wait", "250")

  const gutter = evaluate(
    () => innerWidth - document.documentElement.clientWidth,
  )

  evidence.observations.push({ nativeGutter: gutter })
  assert.ok(gutter > 0, "Scenario not exercised: no native inset scrollbar")

  if (fault === "old-scroll-lock")
    inject(
      "[data-sheet-viewport] body{width:auto} [data-sheet-viewport] #root{width:calc(100% - var(--sheet-page-gutter))}",
    )

  const point = evaluate(() => {
    const rect = document
      .querySelector('[aria-label="Inspect Brand refresh"]')
      .getBoundingClientRect()

    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
  })

  evaluate(() => {
    window.verificationFrames = []
    window.verificationSampling = true
    window.verificationMeasure = () => ({
      root: document.querySelector("#root").getBoundingClientRect().width,
      status: document
        .querySelector("#projects th:nth-child(2)")
        .getBoundingClientRect().x,
      scroll: scrollY,
    })
    window.verificationBefore = window.verificationMeasure()

    const sample = () => {
      window.verificationFrames.push(window.verificationMeasure())

      if (window.verificationSampling) requestAnimationFrame(sample)
    }

    requestAnimationFrame(sample)
  })
  evidence.observations.push({ clickPoint: point })
  browser(
    "mouse",
    "move",
    String(Math.round(point.x)),
    String(Math.round(point.y)),
  )
  browser("mouse", "down")
  browser("mouse", "up")
  browser("wait", '[data-slot="sheet-content"]')
  browser("wait", "250")
  capture("open")
  browser("press", "Escape")
  browser("wait", "300")

  const measurements = evaluate(() => {
    window.verificationSampling = false

    return {
      before: window.verificationBefore,
      frames: window.verificationFrames,
      focused: document.activeElement.getAttribute("aria-label"),
      sheetClosed: !document.querySelector('[data-slot="sheet-content"]'),
    }
  })

  evidence.observations.push(measurements)
  assert.ok(measurements.frames.length > 2, "No transition frames measured")
  assert.ok(
    measurements.frames.every((frame) =>
      Object.keys(measurements.before).every(
        (key) => Math.abs(frame[key] - measurements.before[key]) < 0.5,
      ),
    ),
    "Modal changed background geometry/scroll during its transition",
  )
  assert.equal(measurements.focused, "Inspect Brand refresh")
  assert.ok(measurements.sheetClosed, "Sheet did not dismiss")
}

function overlay() {
  browser("set", "viewport", "320", "700")
  evaluate(async () => {
    document.documentElement.style.fontSize = "200%"
    await document.fonts.ready
    await new Promise((done) =>
      requestAnimationFrame(() => requestAnimationFrame(done)),
    )
  })
  browser("click", ".appearance-trigger")
  browser("wait", "250")

  const bounds = evaluate(() => {
    const dialog = document.querySelector('[data-slot="sheet-content"]')
    const close = dialog.querySelector('[data-slot="sheet-close"]')
    const rect = dialog.getBoundingClientRect()
    const button = close.getBoundingClientRect()

    const heading = dialog
      .querySelector('[data-slot="sheet-title"]')
      .getBoundingClientRect()

    return {
      viewport: { width: innerWidth, height: innerHeight },
      dialog: rect.toJSON(),
      close: button.toJSON(),
      heading: heading.toJSON(),
      overflow: dialog.scrollWidth - dialog.clientWidth,
      hit: close.contains(
        document.elementFromPoint(
          button.x + button.width / 2,
          button.y + button.height / 2,
        ),
      ),
    }
  })

  evidence.observations.push(bounds)
  capture("narrow-enlarged")
  assert.ok(
    bounds.dialog.left >= 0 &&
      bounds.dialog.right <= bounds.viewport.width &&
      bounds.dialog.top >= 0 &&
      bounds.dialog.bottom <= bounds.viewport.height,
    "Dialog exceeds viewport",
  )
  assert.ok(
    bounds.overflow <= 1 && bounds.hit,
    "Dialog overflows or Close cannot be hit",
  )
  assert.ok(
    bounds.heading.right <= bounds.close.left,
    "Dialog title overlaps Close",
  )
  browser("press", "Escape")
  browser(
    "wait",
    "--fn",
    `!document.querySelector('[data-slot="sheet-content"]')`,
  )
  assert.equal(
    evaluate(() => document.activeElement.getAttribute("aria-label")),
    "Customize appearance",
  )
}

mkdirSync(output, { recursive: true })

try {
  assert.ok(
    ["controls", "scrollbar", "overlay"].includes(scenario),
    "Choose controls, scrollbar or overlay",
  )
  browser(
    "open",
    process.env.VERIFY_URL ||
      "http://127.0.0.1:5173/app/demo/overview?period=14",
  )
  browser("set", "viewport", "1440", "900")
  browser("wait", '[aria-label="Task completion period"]')
  evaluate(async () => {
    await document.fonts.ready
  })
  evidence.environment = evaluate(() => ({
    userAgent: navigator.userAgent,
    viewport: { width: innerWidth, height: innerHeight },
    devicePixelRatio,
    url: location.href,
  }))

  if (scenario === "controls") controls()

  if (scenario === "scrollbar") scrollbar()

  if (scenario === "overlay") overlay()

  evidence.status = "passed"
} catch (error) {
  evidence.status = "failed"
  evidence.error = error.message
  process.exitCode = 1
} finally {
  try {
    browser("close")
  } catch (error) {
    evidence.cleanupError = error.message
    evidence.status = "failed"
    process.exitCode = 1
  }

  writeFileSync(
    join(output, `${scenario}.json`),
    `${JSON.stringify(evidence, null, 2)}\n`,
  )
  console.log(
    JSON.stringify({
      scenario,
      fault,
      status: evidence.status,
      error: evidence.error,
      evidence: join(output, `${scenario}.json`),
    }),
  )
}
