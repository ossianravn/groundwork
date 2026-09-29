import type { LucideIcon } from "lucide-react"
import type { ShellLinkComponent } from "./shell-link"

export interface BottomTab<Destination extends string> {
  destination: Destination
  label: string
  icon: LucideIcon
  /** A count shown on the tab, such as unread messages. */
  badge?: { count: number; label: string }
}

// NAV-07: an alternative phone shell whose primary navigation is a bar of
// three to five labelled tabs at the bottom. It replaces the sidebar sheet
// in that shell rather than adding a second primary navigation.
export function BottomTabBar<Destination extends string>({
  items,
  current,
  LinkComponent,
  label = "Primary",
}: {
  items: BottomTab<Destination>[]
  current: Destination
  LinkComponent: ShellLinkComponent<Destination>
  label?: string
}) {
  return (
    <nav className="bottom-tab-bar" aria-label={label}>
      <ul>
        {items.map(({ destination, label: name, icon: Icon, badge }) => (
          <li key={destination}>
            <LinkComponent
              destination={destination}
              className="bottom-tab"
              aria-current={destination === current ? "page" : undefined}
            >
              <span className="bottom-tab-icon">
                <Icon aria-hidden="true" />
                {badge && badge.count > 0 && (
                  <span className="bottom-tab-badge" aria-hidden="true">
                    {badge.count}
                  </span>
                )}
              </span>
              <span>{name}</span>
              {badge && badge.count > 0 && (
                <span className="sr-only">, {badge.label}</span>
              )}
            </LinkComponent>
          </li>
        ))}
      </ul>
    </nav>
  )
}
