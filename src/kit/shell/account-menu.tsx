import { Fragment } from "react"
import { ChevronsUpDown, type LucideIcon } from "lucide-react"
import { MemberAvatar, type AvatarPerson } from "@/kit/member-avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/kit/ui/dropdown-menu"
import type { ShellLinkComponent } from "./shell-link"

/** A link to a destination, or an action such as opening a panel. */
export type AccountMenuItem<Destination extends string> = {
  label: string
  icon: LucideIcon
  /** Starts a new group, separated from the items above it. */
  separated?: boolean
} & ({ destination: Destination } | { id: string; onSelect: () => void })

export interface WorkspaceAccount<Destination extends string> {
  person: AvatarPerson
  detail: string
  items: AccountMenuItem<Destination>[]
}

export function AccountMenu<Destination extends string>({
  account,
  LinkComponent,
  onNavigate,
}: {
  account: WorkspaceAccount<Destination>
  LinkComponent: ShellLinkComponent<Destination>
  onNavigate?: () => void
}) {
  const { person, detail, items } = account

  return (
    <div className="profile-row">
      <DropdownMenu>
        <DropdownMenuTrigger
          className="account-menu-trigger"
          aria-label={`${person.name}, account menu`}
        >
          <MemberAvatar member={person} />
          <span className="navigation-label">
            <span className="block font-medium">{person.name}</span>
            <span className="block text-xs text-muted-foreground">
              {detail}
            </span>
          </span>
          <ChevronsUpDown aria-hidden="true" className="navigation-label" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="account-menu-content">
          {items.map((item) => {
            const Icon = item.icon

            const content = (
              <>
                <Icon aria-hidden="true" />
                {item.label}
              </>
            )

            return (
              <Fragment
                key={"destination" in item ? item.destination : item.id}
              >
                {item.separated && <DropdownMenuSeparator />}
                {"destination" in item ? (
                  <DropdownMenuItem
                    render={<LinkComponent destination={item.destination} />}
                    onClick={onNavigate}
                  >
                    {content}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={item.onSelect}>
                    {content}
                  </DropdownMenuItem>
                )}
              </Fragment>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
