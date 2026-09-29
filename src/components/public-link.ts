import type { ComponentProps, ComponentType } from "react"
import type { ShellLinkComponent, ShellLinkProps } from "@/kit/shell/shell-link"

export type PublicDestination =
  | "home"
  | "reference"
  | "product"
  | "pricing"
  | "blog"
  | "changelog"
  | "customers"
  | "integrations"
  | "about"
  | "careers"
  | "roadmap"
  | "status"
  | "latest-release"
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
  | "project-comments"
  | "import"
  | "timeline"
  | "sign-in"
  | "sign-up"

export type PublicLinkProps = ShellLinkProps<PublicDestination>

export type PublicLinkComponent = ShellLinkComponent<PublicDestination>

/** Links to one customer story by its slug. */
export type StoryLinkComponent = ComponentType<
  Omit<ComponentProps<"a">, "href"> & { slug: string }
>
