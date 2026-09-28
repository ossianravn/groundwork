import type { ComponentProps, ComponentType } from "react"

export type ResourceCollection = "blog" | "help" | "changelog"

export type ResourceLinkProps = Omit<ComponentProps<"a">, "href"> & {
  collection: ResourceCollection
  slug?: string
  hash?: string
}

export type ResourceLinkComponent = ComponentType<ResourceLinkProps>
