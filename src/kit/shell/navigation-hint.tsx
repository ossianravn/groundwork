import type { ReactElement } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/kit/ui/tooltip"
import { useNavigationCollapsed } from "./navigation-collapsed"

// Names a navigation control while the rail hides its visible label.
export function NavigationHint({
  children,
  label,
}: {
  children: ReactElement
  label: string
}) {
  if (!useNavigationCollapsed()) return children

  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}
