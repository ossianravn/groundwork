import type { ReactNode } from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/kit/ui/dropdown-menu"

export interface WorkspaceChoice {
  id: string
  name: string
  detail: string
  current: boolean
}

export interface WorkspaceSwitcherOptions {
  workspaces: WorkspaceChoice[]
  onSelect: (id: string) => void
  onCreate?: () => void
  createLabel?: string
}

/**
 * The sidebar identity row as a menu of workspaces (NAV-03). The current
 * workspace is marked; choosing another hands the switch to the host.
 */
export function WorkspaceSwitcher({
  identity,
  name,
  options,
}: {
  /** The row's visible content: monogram, name and detail. */
  identity: ReactNode
  name: string
  options: WorkspaceSwitcherOptions
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="workspace-identity workspace-switcher"
        aria-label={`Workspace: ${name}. Switch workspace`}
      >
        {identity}
        <ChevronsUpDown
          aria-hidden="true"
          className="workspace-switcher-icon navigation-label"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="workspace-switcher-menu">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          {options.workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              aria-current={workspace.current || undefined}
              onClick={() => {
                if (!workspace.current) options.onSelect(workspace.id)
              }}
            >
              <span className="workspace-choice">
                <span className="font-medium">{workspace.name}</span>
                <span className="text-xs text-muted-foreground">
                  {workspace.detail}
                </span>
              </span>
              {workspace.current && (
                <Check aria-hidden="true" className="ml-auto" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        {options.onCreate && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={options.onCreate}>
                <Plus aria-hidden="true" />
                {options.createLabel ?? "Create a workspace"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
