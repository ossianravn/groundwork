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
}

export function ProjectDetailLink(props: ProjectLinkProps) {
  return <ProjectRouteLink {...props} to="/app/demo/projects/$projectId" />
}

export function ProjectEditLink(props: ProjectLinkProps) {
  return <ProjectRouteLink {...props} to="/app/demo/projects/$projectId/edit" />
}

function ProjectRouteLink({
  projectId,
  children,
  className,
  id,
  title,
  style,
  hash,
  to,
}: ProjectLinkProps & {
  to: "/app/demo/projects/$projectId" | "/app/demo/projects/$projectId/edit"
}) {
  const href = useLocation({ select: (location) => location.href })
  const { returnTo } = useSearch({ strict: false })
  const { onOpenDetail } = useDemoWorkspace()
  const origin = projectReturnTo(returnTo ?? href)

  return (
    <Link
      to={to}
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
          onOpenDetail(origin)
        }
      }}
      className={cn(className)}
      id={id}
      title={title}
      style={style}
    >
      {children}
    </Link>
  )
}
