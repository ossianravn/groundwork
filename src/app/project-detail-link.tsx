import type { CSSProperties, ReactNode } from "react"
import { cn } from "cn"
import { Link, useLocation, useSearch } from "@tanstack/react-router"
import { useDemoWorkspace } from "./workspace-context"
import { projectReturnTo } from "./project-return"

interface ProjectLinkProps {
  projectId: string
  children: ReactNode
  className: string
  id?: string
  title?: string
  style?: CSSProperties
  /** An element on the project page to scroll to, such as a comment. */
  hash?: string
  /**
   * Opens the project in place (its quick view) on a plain click; a click
   * with a modifier, or a middle click, still opens the full page.
   */
  onOpen?: () => void
}

export function ProjectDetailLink({
  projectId,
  children,
  className,
  id,
  title,
  style,
  hash,
  onOpen,
}: ProjectLinkProps) {
  const href = useLocation({ select: (location) => location.href })
  const { returnTo } = useSearch({ strict: false })
  const { onOpenDetail } = useDemoWorkspace()
  const origin = projectReturnTo(returnTo ?? href)

  return (
    <Link
      to="/app/demo/projects/$projectId"
      params={{ projectId }}
      search={{ returnTo: origin }}
      hash={hash}
      onClick={(event) => {
        if (
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey
        ) {
          if (!onOpen) return onOpenDetail(origin)

          event.preventDefault()
          onOpen()
        }
      }}
      className={cn(className)}
      id={id}
      data-quick-view-id={onOpen ? projectId : undefined}
      title={title}
      style={style}
    >
      {children}
    </Link>
  )
}
