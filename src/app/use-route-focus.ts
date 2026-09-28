import { useEffect } from "react"
import { useLocation } from "@tanstack/react-router"
import { useDemoWorkspace } from "./workspace-context"

export function useRouteFocus() {
  const pathname = useLocation({ select: (location) => location.pathname })
  const { results } = useDemoWorkspace()
  const { getFocus } = results
  useEffect(() => {
    // Route changes expose the new page without undoing scroll restoration.
    // An inspector opened from a URL owns focus instead.
    const frame = requestAnimationFrame(() => {
      if (document.querySelector('[role="dialog"]')) return

      const returning = [
        "/app/demo/projects",
        "/app/demo/overview",
        "/app/demo/inbox",
        "/app/demo/analytics",
        "/app/demo/activity",
      ].includes(pathname)
        ? getFocus(window.location.pathname + window.location.search)
        : null

      const target = returning ?? document.getElementById("main-content")
      target?.focus({ preventScroll: true })
    })

    return () => cancelAnimationFrame(frame)
  }, [pathname, getFocus])
}
