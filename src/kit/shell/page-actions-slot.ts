import { createContext, useContext } from "react"

// The workspace shell exposes a place in its top bar for the current page's
// title-row actions, so pages need no separate heading row of their own.
export const PageActionsSlotContext = createContext<HTMLElement | null>(null)

export function usePageActionsSlot() {
  return useContext(PageActionsSlotContext)
}
