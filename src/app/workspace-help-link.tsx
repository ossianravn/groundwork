import { Link } from "@tanstack/react-router"
import type { HelpLinkProps } from "@/features/help/workspace-help"

export function WorkspaceHelpLink({ page, slug, ...props }: HelpLinkProps) {
  if (page === "contact")
    return <Link {...props} to="/contact" search={{ scenario: "normal" }} />

  return slug ? (
    <Link {...props} to="/help/$slug" params={{ slug }} />
  ) : (
    <Link {...props} to="/help" search={{ q: "" }} />
  )
}
