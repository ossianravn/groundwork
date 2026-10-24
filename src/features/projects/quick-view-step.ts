// J and K step through the list behind the quick view. Typing, open menus
// and lists keep their keys, and a step never runs past either end.
export const quickViewKeyOwners =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"], [role="combobox"], [role="listbox"], [role="menu"]'

export function quickViewStep(
  event: Pick<
    KeyboardEvent,
    "key" | "altKey" | "ctrlKey" | "metaKey" | "defaultPrevented"
  >,
  position: { index: number; count: number },
  /** Whether the focused element matches `quickViewKeyOwners`. */
  keyOwned: boolean,
): -1 | 1 | null {
  const key = event.key.toLowerCase()
  const step = key === "j" ? 1 : key === "k" ? -1 : null

  if (
    !step ||
    keyOwned ||
    event.defaultPrevented ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey
  )
    return null

  const next = position.index + step

  return next >= 0 && next < position.count ? step : null
}
