import type { ShellLinkComponent, ShellLinkProps } from "@/kit/shell/shell-link"

export type WorkspaceDestination =
  | "overview"
  | "projects"
  | "inbox"
  | "assistant"
  | "analytics"
  | "activity"
  | "profile"
  | "appearance"
  | "notifications"
  | "workspace"
  | "sign-in"
  /** A project page's origin, from its returnTo search. */
  | "return"
  /** The project whose editor is open, keeping its returnTo. */
  | "project"

export type WorkspaceLinkProps = ShellLinkProps<WorkspaceDestination>

export type WorkspaceLinkComponent = ShellLinkComponent<WorkspaceDestination>
