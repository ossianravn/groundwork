import type { ComponentProps, ReactNode } from "react"
import { createPortal } from "react-dom"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { usePageActionsSlot } from "./page-actions-slot"

/** Places the page's primary actions and short context in the shell top bar. */
export function PageActions({
  children,
  meta,
}: {
  children?: ReactNode
  meta?: ReactNode
}) {
  const slot = usePageActionsSlot()

  if (!slot) return null

  return createPortal(
    <>
      {meta && <span className="page-meta">{meta}</span>}
      {children}
    </>,
    slot,
  )
}

/** A top-bar action whose label collapses to its icon on narrow screens. */
export function PageAction({
  icon: Icon,
  label,
  ...props
}: Omit<ComponentProps<typeof Button>, "children"> & {
  icon: LucideIcon
  label: string
}) {
  return (
    <Button className="page-action" {...props}>
      <Icon data-icon="inline-start" aria-hidden="true" />
      <span className="page-action-label">{label}</span>
    </Button>
  )
}
