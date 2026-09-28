import type { ReactNode } from "react"
import { ArrowUpRight, type LucideIcon } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { AccountMenu, type WorkspaceAccount } from "./account-menu"
import { BrandMark } from "./brand-mark"
import { NavigationCollapsedContext } from "./navigation-collapsed"
import { NavigationHint } from "./navigation-hint"
import type { ShellBrand, ShellLinkComponent } from "./shell-link"

export interface WorkspaceNavigationItem<Destination extends string> {
  id: string
  destination: Destination
  label: string
  icon: LucideIcon
  /** Shown beside the label when defined. */
  count?: number
  /** Replaces the label for assistive technology and the collapsed hint. */
  accessibleLabel?: string
}

export type WorkspaceNavigationAction = {
  id: string
  label: string
  icon: LucideIcon
} & ({ onSelect: () => void } | { href: string })

export interface WorkspaceIdentity {
  name: string
  detail: string
  logo?: string
}

export interface WorkspaceNavigationProps<Destination extends string> {
  LinkComponent: ShellLinkComponent<Destination>
  brand: ShellBrand
  home: { destination: Destination; label: string }
  workspace: WorkspaceIdentity
  navigationLabel: string
  items: WorkspaceNavigationItem<Destination>[]
  currentItem?: string
  actions: WorkspaceNavigationAction[]
  notice?: ReactNode
  account: WorkspaceAccount<Destination>
}

export function WorkspaceNavigation<Destination extends string>({
  LinkComponent,
  brand,
  home,
  workspace,
  navigationLabel,
  items,
  currentItem,
  actions,
  notice,
  account,
  onNavigate,
  collapsed = false,
  headerAction,
}: WorkspaceNavigationProps<Destination> & {
  onNavigate?: () => void
  collapsed?: boolean
  headerAction?: ReactNode
}) {
  const initials = workspace.name
    .trim()
    .split(/\s+/u)
    .slice(0, 2)
    .map((word) => Array.from(word)[0])
    .join("")
    .toLocaleUpperCase()

  return (
    <NavigationCollapsedContext value={collapsed}>
      <div className="workspace-navigation">
        <div className="navigation-brand-row">
          <LinkComponent
            destination={home.destination}
            className="brand"
            onClick={onNavigate}
            aria-label={home.label}
          >
            <BrandMark brand={brand} nameClassName="navigation-label" />
          </LinkComponent>
          {headerAction}
        </div>
        <div className="workspace-identity" aria-label={workspace.name}>
          <span className="workspace-monogram">
            {workspace.logo ? <img src={workspace.logo} alt="" /> : initials}
          </span>
          <div className="navigation-label">
            <p className="font-medium">{workspace.name}</p>
            <p className="text-xs text-muted-foreground">{workspace.detail}</p>
          </div>
        </div>
        <nav aria-label={navigationLabel} className="nav-section">
          <p className="nav-label navigation-label">{navigationLabel}</p>
          {items.map((item) => {
            const name = item.accessibleLabel ?? item.label
            const Icon = item.icon

            return (
              <NavigationHint key={item.id} label={name}>
                <LinkComponent
                  className="nav-link"
                  destination={item.destination}
                  aria-current={currentItem === item.id ? "page" : undefined}
                  aria-label={name}
                  onClick={onNavigate}
                >
                  <Icon aria-hidden="true" />
                  <span className="navigation-label">{item.label}</span>
                  {item.count !== undefined && (
                    <span className="nav-count navigation-label">
                      {item.count}
                    </span>
                  )}
                </LinkComponent>
              </NavigationHint>
            )
          })}
        </nav>
        <div className="nav-section mt-auto">
          {actions.map((action) => (
            <NavigationAction key={action.id} action={action} />
          ))}
        </div>
        {notice}
        <AccountMenu
          account={account}
          LinkComponent={LinkComponent}
          onNavigate={onNavigate}
        />
      </div>
    </NavigationCollapsedContext>
  )
}

function NavigationAction({ action }: { action: WorkspaceNavigationAction }) {
  const Icon = action.icon

  if ("href" in action) {
    const name = `${action.label} (opens in a new tab)`

    return (
      <NavigationHint label={name}>
        <a
          className="nav-link"
          href={action.href}
          target="_blank"
          rel="noreferrer"
          aria-label={name}
        >
          <Icon aria-hidden="true" />
          <span className="navigation-label">{action.label}</span>
          <ArrowUpRight
            className="navigation-label ml-auto"
            aria-hidden="true"
          />
        </a>
      </NavigationHint>
    )
  }

  return (
    <NavigationHint label={action.label}>
      <Button
        variant="ghost"
        className="nav-action"
        onClick={action.onSelect}
        aria-label={action.label}
      >
        <Icon data-icon="inline-start" aria-hidden="true" />
        <span className="navigation-label">{action.label}</span>
      </Button>
    </NavigationHint>
  )
}
