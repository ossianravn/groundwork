"use client"

import { Fragment, useRef, useState, type ReactNode } from "react"
import { ArrowLeft, ChevronRight, Menu, PanelLeft, X } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/kit/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/kit/ui/sheet"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/kit/ui/tooltip"
import {
  WorkspaceNavigation,
  type WorkspaceNavigationProps,
} from "./workspace-navigation"
import { PageActionsSlotContext } from "./page-actions-slot"
import { useHeaderOffset } from "./use-header-offset"

export interface Breadcrumb<Destination extends string> {
  label: string
  destination?: Destination
}

interface WorkspaceShellProps<
  Destination extends string,
> extends WorkspaceNavigationProps<Destination> {
  children: ReactNode
  /** The first entry names the workspace; the last is the current page. */
  breadcrumbs: Breadcrumb<Destination>[]
  /** A TopbarSearch, placed after the page's own actions. */
  search?: ReactNode
  topbarActions?: ReactNode
}

export function WorkspaceShell<Destination extends string>({
  children,
  breadcrumbs,
  search,
  topbarActions,
  ...navigation
}: WorkspaceShellProps<Destination>) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [actionsSlot, setActionsSlot] = useState<HTMLDivElement | null>(null)
  const navigatedFromMenu = useRef(false)
  const header = useHeaderOffset()
  const [root, ...trail] = breadcrumbs
  const { LinkComponent } = navigation

  // Phones show only the current page; its nearest linked ancestor becomes
  // a back arrow, so records need no in-page back link.
  const parent = trail
    .slice(0, -1)
    .reverse()
    .find((crumb) => crumb.destination !== undefined)

  // Actions in the phone menu close it before opening their own overlay.
  const closeMenuFirst = (select: () => void) => () => {
    setMenuOpen(false)
    select()
  }

  return (
    <div className="app-shell" data-sidebar-collapsed={collapsed}>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <aside id="desktop-navigation" className="desktop-sidebar">
        <WorkspaceNavigation {...navigation} collapsed={collapsed} />
      </aside>
      <Sheet
        open={menuOpen}
        onOpenChange={setMenuOpen}
        onOpenChangeComplete={(open) => {
          if (!open && navigatedFromMenu.current) {
            document
              .getElementById("main-content")
              ?.focus({ preventScroll: true })
          }
        }}
      >
        <SheetContent
          side="left"
          className="mobile-sidebar"
          showCloseButton={false}
          finalFocus={() => !navigatedFromMenu.current}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Workspace navigation</SheetTitle>
            <SheetDescription>
              Navigate this workspace or change its appearance.
            </SheetDescription>
          </SheetHeader>
          <WorkspaceNavigation
            {...navigation}
            headerAction={
              <SheetClose render={<Button variant="ghost" size="icon" />}>
                <X aria-hidden="true" />
                <span className="sr-only">Close</span>
              </SheetClose>
            }
            onNavigate={() => {
              navigatedFromMenu.current = true
              setMenuOpen(false)
            }}
            actions={navigation.actions.map((action) =>
              "onSelect" in action
                ? { ...action, onSelect: closeMenuFirst(action.onSelect) }
                : action,
            )}
            account={{
              ...navigation.account,
              items: navigation.account.items.map((item) =>
                "onSelect" in item
                  ? { ...item, onSelect: closeMenuFirst(item.onSelect) }
                  : item,
              ),
            }}
          />
        </SheetContent>
      </Sheet>
      <div className="workspace-content">
        <header ref={header} className="topbar">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="desktop-menu-button"
                  aria-label={
                    collapsed ? "Expand navigation" : "Collapse navigation"
                  }
                  aria-expanded={!collapsed}
                  aria-controls="desktop-navigation"
                  onClick={() => setCollapsed(!collapsed)}
                />
              }
            >
              <PanelLeft aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent>
              {collapsed ? "Expand navigation" : "Collapse navigation"}
            </TooltipContent>
          </Tooltip>
          <Button
            variant="ghost"
            size="icon"
            className="mobile-menu-button"
            aria-label="Open navigation"
            onClick={() => {
              navigatedFromMenu.current = false
              setMenuOpen(true)
            }}
          >
            <Menu aria-hidden="true" />
          </Button>
          <nav
            aria-label="Breadcrumb"
            className={
              trail.length > 1 ? "breadcrumb breadcrumb-detail" : "breadcrumb"
            }
          >
            {parent?.destination && (
              <LinkComponent
                destination={parent.destination}
                className="breadcrumb-back"
                aria-label={`Back to ${parent.label}`}
              >
                <ArrowLeft aria-hidden="true" />
              </LinkComponent>
            )}
            <span className="breadcrumb-root text-muted-foreground">
              {root?.label}
            </span>
            {trail.map((crumb, index) => (
              <Fragment key={`${index}-${crumb.label}`}>
                <ChevronRight aria-hidden="true" />
                {index === trail.length - 1 ? (
                  <span
                    aria-current="page"
                    className={cn(
                      "breadcrumb-current",
                      trail.length > 1 && "truncate",
                    )}
                  >
                    {crumb.label}
                  </span>
                ) : crumb.destination ? (
                  <LinkComponent
                    destination={crumb.destination}
                    className="breadcrumb-parent"
                  >
                    {crumb.label}
                  </LinkComponent>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </Fragment>
            ))}
          </nav>
          <div className="topbar-actions">
            <div className="topbar-page-actions" ref={setActionsSlot} />
            {search}
            {topbarActions}
          </div>
        </header>
        <PageActionsSlotContext value={actionsSlot}>
          {children}
        </PageActionsSlotContext>
      </div>
    </div>
  )
}
