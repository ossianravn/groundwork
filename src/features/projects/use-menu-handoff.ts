import { useRef } from "react"

// A menu action that hands focus on must stop the closing menu from pulling
// it back. Opening the inspector waits until a context menu has fully
// closed: while it is open its focus trap keeps focus, so the inspector
// would otherwise remember a removed menu item as its return target.
export function useMenuHandoff(onInspect: (id: string) => void) {
  const handoff = useRef(false)
  const pending = useRef<string | null>(null)

  return {
    /** Mark that the chosen action moves focus elsewhere. */
    handOff() {
      handoff.current = true
    },
    inspectAfterClose(id: string) {
      handoff.current = true
      pending.current = id
    },
    onOpenChange(open: boolean) {
      if (open) {
        handoff.current = false
        pending.current = null
      }
    },
    onOpenChangeComplete(open: boolean) {
      const id = pending.current

      if (open || !id) return
      pending.current = null
      // The inspector returns focus to the item's inspect button.
      document
        .getElementById(`project-inspect-${id}`)
        ?.focus({ preventScroll: true })
      onInspect(id)
    },
    finalFocus: () => !handoff.current,
  }
}
