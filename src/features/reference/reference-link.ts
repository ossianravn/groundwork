import type { ComponentProps, ComponentType } from "react"

export type ReferenceLinkProps = Omit<ComponentProps<"a">, "href"> & {
  destination:
    | "home"
    | "components"
    | "component"
    | "patterns"
    | "pattern"
    | "themes"
    | "charts"
    | "states"
    | "website"
    | "demo"
  component?: string
  patternId?: string
}

export type ReferenceLinkComponent = ComponentType<ReferenceLinkProps>

export type ReferenceContextLinkComponent = ComponentType<
  ComponentProps<"a"> & { href: string }
>
