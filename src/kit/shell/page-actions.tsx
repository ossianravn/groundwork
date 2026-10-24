"use client"

import type { ComponentProps, ReactElement, ReactNode } from "react"
import { createPortal } from "react-dom"
import { Ellipsis, type LucideIcon } from "lucide-react"
import { Button } from "@/kit/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/kit/ui/dropdown-menu"
import { usePageActionsSlot } from "./page-actions-slot"

/** A secondary page action: a button, or a link the host's router renders. */
export type PageMenuAction = {
  id: string
  label: string
  icon: LucideIcon
} & ({ onSelect: () => void } | { render: ReactElement })

/**
 * Places the page's actions and short context in the shell top bar. Primary
 * actions are children; secondary actions (`more`) are outline buttons on
 * wide screens and fold into a ⋯ menu on phones.
 */
export function PageActions({
  children,
  meta,
  more = [],
}: {
  children?: ReactNode
  meta?: ReactNode
  more?: PageMenuAction[]
}) {
  const slot = usePageActionsSlot()

  if (!slot) return null

  return createPortal(
    <>
      {meta && <span className="page-meta">{meta}</span>}
      {more.map(({ id, label, icon: Icon, ...action }) => (
        <Button
          key={id}
          variant="outline"
          className="page-action page-action-secondary"
          {...("render" in action
            ? { render: action.render, nativeButton: false }
            : { onClick: action.onSelect })}
        >
          <Icon data-icon="inline-start" aria-hidden="true" />
          {label}
        </Button>
      ))}
      {more.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="page-actions-more"
                aria-label="More actions"
              />
            }
          >
            <Ellipsis aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {more.map(({ id, label, icon: Icon, ...action }) => (
              <DropdownMenuItem
                key={id}
                {...("render" in action
                  ? { render: action.render }
                  : { onClick: action.onSelect })}
              >
                <Icon aria-hidden="true" />
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
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
