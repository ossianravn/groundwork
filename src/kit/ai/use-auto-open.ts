import { useState } from "react"

/**
 * Open while work is in progress and close when it finishes, until the person
 * opens or closes it themselves; from then on their choice stands.
 */
export function useAutoOpen(active: boolean) {
  const [open, setOpen] = useState(active)
  const [chosen, setChosen] = useState(false)
  const [wasActive, setWasActive] = useState(active)

  if (wasActive !== active) {
    setWasActive(active)

    if (!chosen) setOpen(active)
  }

  return {
    open,
    onOpenChange: (next: boolean) => {
      setChosen(true)
      setOpen(next)
    },
  }
}
