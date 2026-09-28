import { Link } from "@tanstack/react-router"
import type { ResourceLinkProps } from "@/features/resources/resource-link"

export function ResourceLink({
  collection,
  slug,
  hash,
  ...props
}: ResourceLinkProps) {
  switch (collection) {
    case "blog":
      return slug ? (
        <Link {...props} to="/blog/$slug" params={{ slug }} hash={hash} />
      ) : (
        <Link {...props} to="/blog" hash={hash} />
      )
    case "help":
      return slug ? (
        <Link {...props} to="/help/$slug" params={{ slug }} hash={hash} />
      ) : (
        <Link {...props} to="/help" search={{ q: "" }} hash={hash} />
      )
    case "changelog":
      return slug ? (
        <Link
          {...props}
          to="/changelog/$version"
          params={{ version: slug }}
          hash={hash}
        />
      ) : (
        <Link {...props} to="/changelog" hash={hash} />
      )
  }
}
