export type WorkspaceShortcut = "search" | "help" | null

export function workspaceShortcut(
  event: Pick<
    KeyboardEvent,
    | "key"
    | "ctrlKey"
    | "metaKey"
    | "altKey"
    | "shiftKey"
    | "repeat"
    | "isComposing"
    | "defaultPrevented"
  >,
  editing: boolean,
  overlay: boolean,
): WorkspaceShortcut {
  if (
    event.defaultPrevented ||
    event.repeat ||
    event.isComposing ||
    editing ||
    overlay ||
    event.altKey
  )
    return null

  if (
    (event.ctrlKey || event.metaKey) &&
    !event.shiftKey &&
    event.key.toLowerCase() === "k"
  )
    return "search"

  if (event.key === "?" && !event.ctrlKey && !event.metaKey) return "help"

  return null
}
