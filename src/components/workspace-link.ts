import type { ShellLinkComponent, ShellLinkProps } from "@/kit/shell/shell-link"

export type WorkspaceDestination =
  | "overview"
  | "projects"
  | "inbox"
  | "analytics"
  | "activity"
  | "profile"
  | "appearance"
  | "notifications"
  | "workspace"
  | "sign-in"

export type WorkspaceLinkProps = ShellLinkProps<WorkspaceDestination>

export type WorkspaceLinkComponent = ShellLinkComponent<WorkspaceDestination>
