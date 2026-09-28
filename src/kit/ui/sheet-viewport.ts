// Move the reserved gutter to the body while sheets occupy the full viewport.
// A root scrollbar gutter clips painting and hit testing, including fixed layers.
const activeViewports = new WeakMap<Document, { count: number }>()

export function preserveSheetPageWidth(element: HTMLDivElement | null) {
  if (!element) return

  const doc = element.ownerDocument
  const root = doc.documentElement
  let active = activeViewports.get(doc)

  if (!active) {
    const gutter = Math.max(
      0,
      (doc.defaultView?.innerWidth ?? root.clientWidth) -
        root.getBoundingClientRect().width,
    )

    root.style.setProperty("--sheet-page-gutter", `${gutter}px`)
    root.setAttribute("data-sheet-viewport", "")
    active = { count: 0 }
    activeViewports.set(doc, active)
  }

  active.count += 1

  return () => {
    active.count -= 1

    if (active.count === 0) {
      root.removeAttribute("data-sheet-viewport")
      root.style.removeProperty("--sheet-page-gutter")
      activeViewports.delete(doc)
    }
  }
}
