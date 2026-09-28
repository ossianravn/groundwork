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

export interface AccountMenuItem<Destination extends string> {
  destination: Destination
  label: string
  icon: LucideIcon
  /** Starts a new group, separated from the items above it. */
  separated?: boolean
}

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
        <DropdownMenuContent align="start">
          {items.map(({ destination, label, icon: Icon, separated }) => (
            <Fragment key={destination}>
              {separated && <DropdownMenuSeparator />}
              <DropdownMenuItem
                render={<LinkComponent destination={destination} />}
                onClick={onNavigate}
              >
                <Icon aria-hidden="true" />
                {label}
              </DropdownMenuItem>
            </Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
