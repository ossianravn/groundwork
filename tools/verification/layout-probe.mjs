// Runs in the page (serialised by layout-contract.mjs). Checks the layout
// rules in docs/design-system.md › Page anatomy against the rendered DOM and
// returns what breaks them. Rule values come from the role tokens, so the
// probe follows the current density and breakpoint.
export function layoutProbe() {
  const issues = []
  const root = getComputedStyle(document.documentElement)

  const token = (name) => {
    const value = root.getPropertyValue(name).trim()
    const probe = document.createElement("div")

    probe.style.cssText = `position:absolute;visibility:hidden;width:${value || "0"}`
    document.body.append(probe)
    const px = probe.getBoundingClientRect().width
    probe.remove()

    return value ? Math.round(px * 10) / 10 : null
  }

  const box = (el) => el.getBoundingClientRect()
  const near = (a, b) => Math.abs(a - b) <= 1

  const visible = (el) =>
    box(el).height > 0 && getComputedStyle(el).visibility !== "hidden"

  const name = (el) => {
    const zone = el.getAttribute("data-page-zone")
    const slot = el.getAttribute("data-slot")

    const text = (el.textContent || "")
      .trim()
      .replace(/\s+/gu, " ")
      .slice(0, 28)

    return `${el.tagName.toLowerCase()}${zone ? `[zone=${zone}]` : ""}${slot ? `[${slot}]` : ""} "${text}"`
  }

  // Shell rules hold on every route.
  if (document.documentElement.scrollWidth > innerWidth + 1)
    issues.push(
      `page scrolls sideways: ${document.documentElement.scrollWidth}px wide at ${innerWidth}px`,
    )

  const topbar = document.querySelector(".topbar")

  const brand = document.querySelector(
    ".desktop-sidebar [data-slot=sidebar-brand]",
  )

  if (topbar && brand && visible(brand)) {
    const bar = box(topbar)
    const mark = box(brand)

    if (!near(mark.top + mark.height / 2, bar.top + bar.height / 2))
      issues.push(
        `sidebar brand centre ${Math.round(mark.top + mark.height / 2)} is off the top bar axis ${Math.round(bar.top + bar.height / 2)}`,
      )
  }

  const main = document.querySelector("main")

  const zones = main
    ? [...main.querySelectorAll("[data-page-zone]")].filter(
        (el) => visible(el) && !el.parentElement?.closest("[data-page-zone]"),
      )
    : []

  if (!zones.length) return { issues, zones: 0 }

  const inset = token("--inset-page")
  const gapZone = token("--gap-zone")
  const gapSection = token("--gap-section")

  if (inset === null || gapZone === null || gapSection === null)
    return {
      issues: [
        ...issues,
        "role tokens --inset-page, --gap-zone and --gap-section are missing",
      ],
      zones: zones.length,
    }

  const bar = topbar ? box(topbar) : { bottom: box(main).top }
  const edge = box(main).left + inset

  // The optical edge: the first visible text inside an element.
  const textLeft = (el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    let node

    while ((node = walker.nextNode())) {
      if (
        !node.textContent.trim() ||
        !node.parentElement ||
        !visible(node.parentElement)
      )
        continue
      const range = document.createRange()
      range.selectNodeContents(node)
      const rect = [...range.getClientRects()].find((r) => r.width > 0)

      if (rect) return rect.left
    }

    return null
  }

  zones.forEach((zone, index) => {
    const kind = zone.getAttribute("data-page-zone")
    const rect = box(zone)
    const previous = zones[index - 1]

    // Full-bleed panes start at the top bar; their text keeps the content edge.
    if (kind === "pane") {
      const left = textLeft(zone)

      if (left !== null && !near(left, edge) && rect.left <= box(main).left + 1)
        issues.push(
          `${name(zone)} text starts at ${Math.round(left)}, not the content edge ${Math.round(edge)}`,
        )

      return
    }

    if (!near(rect.left, edge))
      issues.push(
        `${name(zone)} starts at x=${Math.round(rect.left)}, not the content edge ${Math.round(edge)}`,
      )

    const above = previous
      ? rect.top - box(previous).bottom
      : rect.top - bar.bottom

    const expected = !previous
      ? inset
      : kind === "section" &&
          previous.getAttribute("data-page-zone") === "section"
        ? gapSection
        : gapZone

    if (!near(above, expected))
      issues.push(
        `${name(zone)} is ${Math.round(above)}px below ${previous ? "the zone above" : "the top bar"}, not ${expected}px`,
      )

    // One control height per toolbar. A framed group (an input group, or
    // buttons sharing one frame) counts as one control.
    if (kind === "toolbar") {
      const groups = "[data-slot=input-group], [data-control-group]"

      const controls = [
        ...zone.querySelectorAll(
          `button, input:not([type=checkbox]):not([type=radio]), ${groups}`,
        ),
      ].filter(
        (el) =>
          visible(el) &&
          box(el).height >= 24 &&
          !el.parentElement?.closest(groups),
      )

      const heights = [
        ...new Set(controls.map((el) => Math.round(box(el).height))),
      ]

      if (heights.length > 1)
        issues.push(
          `${name(zone)} mixes control heights ${heights.join(", ")}px`,
        )
    }
  })

  // Type and weight ramps hold for every text inside the zones.
  const sizes = new Set([12, 14, 16, 20, 28, 32])
  const weights = new Set(["400", "500", "600"])
  const off = new Map()

  for (const zone of zones)
    for (const el of zone.querySelectorAll("*")) {
      if (
        el.closest(
          "svg, pre, code, [data-slot=code-block], [data-slot=terminal]",
        )
      )
        continue

      if (
        ![...el.childNodes].some(
          (node) => node.nodeType === 3 && node.textContent.trim(),
        )
      )
        continue

      if (!visible(el)) continue
      const style = getComputedStyle(el)
      const size = Math.round(parseFloat(style.fontSize) * 10) / 10

      if (!sizes.has(size)) off.set(`font-size ${size}px`, name(el))

      if (!weights.has(style.fontWeight))
        off.set(`font-weight ${style.fontWeight}`, name(el))
    }

  for (const [rule, where] of off)
    issues.push(`${rule} is off the type ramp (first at ${where})`)

  return { issues, zones: zones.length }
}
