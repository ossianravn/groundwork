import type { CSSProperties, ReactNode } from "react"
import type { Project } from "@/demo/model"

export interface ProjectLinkProps {
  id?: string
  className: string
  style?: CSSProperties
  children: ReactNode
}

/**
 * How Overview's lists name a project. A host passes a router link to the
 * project's page; without one, the name is a button for `onSelect`.
 */
export type ProjectLinkRenderer = (
  project: Project,
  props: ProjectLinkProps,
) => ReactNode

export function projectButton(
  onSelect: (id: string) => void,
): ProjectLinkRenderer {
  return function ProjectButton(project, { children, ...props }) {
    return (
      <button type="button" {...props} onClick={() => onSelect(project.id)}>
        {children}
      </button>
    )
  }
}
