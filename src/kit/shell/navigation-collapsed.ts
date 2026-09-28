import { createContext, useContext } from "react"

export const NavigationCollapsedContext = createContext(false)

export function useNavigationCollapsed() {
  return useContext(NavigationCollapsedContext)
}
