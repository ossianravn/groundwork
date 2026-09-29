import { useEffect, useState } from "react"

// A thin bar across the top while a route loads (EDGE-08). The host passes
// its router's pending state; the bar only appears after a short delay so
// fast navigations stay calm, then finishes when loading ends.
const delay = 150

export function RouteProgress({ pending }: { pending: boolean }) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle")

  useEffect(() => {
    if (pending) {
      const timer = setTimeout(() => setState("loading"), delay)

      return () => clearTimeout(timer)
    }

    // Finish a visible bar, then remove it; both happen outside the effect.
    const finish = setTimeout(() =>
      setState((current) => (current === "loading" ? "done" : "idle")),
    )

    const remove = setTimeout(() => setState("idle"), 400)

    return () => {
      clearTimeout(finish)
      clearTimeout(remove)
    }
  }, [pending])

  if (state === "idle") return null

  return (
    <div
      className="route-progress"
      data-state={state}
      role="progressbar"
      aria-label="Loading page"
      aria-busy={state === "loading"}
    />
  )
}
