import { ListFilter } from "lucide-react"
import { Button } from "@/kit/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/kit/ui/drawer"
import type { ReactNode } from "react"

// Phone-sized filtering: one Filters button replaces a row of facet buttons
// and opens a bottom drawer holding each facet's FacetOptions. Choices apply at
// once; the close button states how many results remain.
export function FacetDrawer({
  title,
  active,
  children,
  resultLabel,
  onClear,
  className,
}: {
  title: string
  /** Selected options across all facets. */
  active: number
  children: ReactNode
  /** For example "Show 4 projects". */
  resultLabel: string
  /** Clears every facet in one change. */
  onClear: () => void
  className?: string
}) {
  return (
    <Drawer>
      <DrawerTrigger
        className={
          className
            ? `facet-drawer-trigger ${className}`
            : "facet-drawer-trigger"
        }
        data-active={active > 0 || undefined}
        render={<Button variant="outline" />}
        aria-label={active ? `Filters, ${active} selected` : "Filters"}
      >
        <ListFilter data-icon="inline-start" aria-hidden="true" />
        Filters
        {active > 0 && <span aria-hidden="true">({active})</span>}
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="facet-drawer-body">{children}</div>
        <DrawerFooter className="facet-drawer-footer">
          <Button
            variant="ghost"
            disabled={active === 0}
            focusableWhenDisabled
            onClick={onClear}
          >
            Clear filters
          </Button>
          <DrawerClose render={<Button />}>{resultLabel}</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
