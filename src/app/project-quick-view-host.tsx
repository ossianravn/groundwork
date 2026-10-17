import { buttonVariants } from "@/kit/ui/button"
import type { Project } from "@/demo/model"
import { ProjectQuickView } from "@/features/projects/project-quick-view"
import { ProjectDetailLink } from "./project-detail-link"
import { useProjectRecord } from "./use-project-record"

export function ProjectQuickViewHost({
  project,
  order,
  created,
  onOpen,
  onClose,
  returnFocus,
}: {
  project: Project
  /** The list it was opened from; all projects when that doesn't hold it. */
  order: string[]
  created: boolean
  onOpen: (id: string) => void
  onClose: () => void
  returnFocus: () => HTMLElement | null
}) {
  const record = useProjectRecord(project)
  const index = order.indexOf(project.id)

  return (
    <ProjectQuickView
      {...record}
      notice={created ? "Project created." : undefined}
      fullPage={
        <ProjectDetailLink
          projectId={project.id}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Open full page
        </ProjectDetailLink>
      }
      position={
        index < 0
          ? undefined
          : {
              index,
              count: order.length,
              onStep: (step) => {
                const next = order[index + step]

                if (next) onOpen(next)
              },
            }
      }
      onClose={onClose}
      returnFocus={returnFocus}
    />
  )
}
