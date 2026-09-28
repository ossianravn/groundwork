import { useEffect, useState } from "react"
import { workspaceShortcut } from "@/features/help/shortcuts"
import type { HelpView } from "@/features/help/workspace-help"

export function useWorkspaceHelp(onSearch: () => void) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<HelpView>("help")

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target

      const editing =
        target instanceof HTMLElement &&
        !!target.closest(
          'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="textbox"]',
        )

      const overlay = !!document.querySelector(
        '[role="dialog"], [role="alertdialog"], [data-slot="dropdown-menu-content"], [data-slot="popover-content"]',
      )

      const action = workspaceShortcut(event, editing, overlay)

      if (!action) return
      event.preventDefault()

      if (action === "search") onSearch()
      else {
        setView("shortcuts")
        setOpen(true)
      }
    }

    window.addEventListener("keydown", onKeyDown)

    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onSearch])

  return {
    open,
    setOpen,
    view,
    setView,
    show: () => {
      setView("help")
      setOpen(true)
    },
  }
}
