import type { ShellLinkComponent, ShellLinkProps } from "@/kit/shell/shell-link"

export type PublicDestination =
  | "home"
  | "reference"
  | "product"
  | "pricing"
  | "blog"
  | "changelog"
  | "help"
  | "contact"
  | "privacy"
  | "terms"
  | "features"
  | "questions"
  | "demo"
  | "projects"
  | "board"
  | "project-detail"
  | "sign-in"
  | "sign-up"

export type PublicLinkProps = ShellLinkProps<PublicDestination>

export type PublicLinkComponent = ShellLinkComponent<PublicDestination>
