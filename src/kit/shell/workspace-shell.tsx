import { Fragment, useRef, useState, type ReactNode } from "react"
import {
  ChevronRight,
  Menu,
  PanelLeft,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
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
  search?: {
    label: string
    accessibleLabel: string
    keyShortcuts?: string
    onOpen: () => void
  }
  topbarActions?: ReactNode
  onCustomize: () => void
}

export function WorkspaceShell<Destination extends string>({
  children,
  breadcrumbs,
  search,
  topbarActions,
  onCustomize,
  ...navigation
}: WorkspaceShellProps<Destination>) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [actionsSlot, setActionsSlot] = useState<HTMLDivElement | null>(null)
  const navigatedFromMenu = useRef(false)
  const header = useHeaderOffset()
  const [root, ...trail] = breadcrumbs
  const { LinkComponent } = navigation

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
                ? {
                    ...action,
                    onSelect: () => {
                      setMenuOpen(false)
                      action.onSelect()
                    },
                  }
                : action,
            )}
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
            <span className="text-muted-foreground">{root?.label}</span>
            {trail.map((crumb, index) => (
              <Fragment key={`${index}-${crumb.label}`}>
                <ChevronRight aria-hidden="true" />
                {index === trail.length - 1 ? (
                  <span
                    aria-current="page"
                    className={trail.length > 1 ? "truncate" : undefined}
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
            {search && (
              <Button
                variant="ghost"
                className="search-trigger"
                onClick={search.onOpen}
                aria-label={search.accessibleLabel}
                aria-keyshortcuts={search.keyShortcuts}
              >
                <Search aria-hidden="true" data-icon="inline-start" />
                <span>{search.label}</span>
              </Button>
            )}
            {topbarActions}
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="appearance-trigger"
                    aria-label="Customize appearance"
                    onClick={onCustomize}
                  />
                }
              >
                <SlidersHorizontal aria-hidden="true" />
              </TooltipTrigger>
              <TooltipContent>Customize appearance</TooltipContent>
            </Tooltip>
          </div>
        </header>
        <PageActionsSlotContext value={actionsSlot}>
          {children}
        </PageActionsSlotContext>
      </div>
    </div>
  )
}
