import type { ComponentProps, ComponentType, ReactNode } from "react"

// Shells name destinations; the host supplies the router-aware link that
// resolves them, so the kit never depends on a routing library.
export type ShellLinkProps<Destination extends string> = Omit<
  ComponentProps<"a">,
  "href"
> & {
  destination: Destination
}

export type ShellLinkComponent<Destination extends string> = ComponentType<
  ShellLinkProps<Destination>
>

export interface ShellBrand {
  icon: ReactNode
  name: ReactNode
}
