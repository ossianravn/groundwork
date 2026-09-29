import { documentText } from "@/kit/rich-text/document"
import type { ReactNode } from "react"
import { ProjectProgress } from "./project-progress"
import { Sheet, SheetContent } from "@/kit/ui/sheet"
import { PanelHeader } from "@/kit/panel-header"
import { MemberAvatar } from "@/kit/member-avatar"
import { ProjectStatus } from "@/components/project-status"
import { ProjectMark } from "@/components/project-identity"
import { formatDate, type Member, type Project } from "@/demo/model"

export function ProjectDetails({
  project,
  created,
  members,
  onClose,
  onComplete,
  returnFocus,
  detailLink,
}: {
  project: Project | undefined
  created: boolean
  members: Member[]
  onClose: () => void
  onComplete: (id: string) => void
  returnFocus: () => HTMLElement | null
  detailLink?: ReactNode
}) {
  if (!project) return null
  const owner = members.find((member) => member.id === project.ownerId)

  if (!owner) throw new Error(`Project ${project.id} has an unknown owner`)

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <SheetContent
        className="panel-sheet"
        showCloseButton={false}
        finalFocus={returnFocus}
      >
        <div className="panel-scroll">
          <PanelHeader
            title={project.name}
            leading={<ProjectMark color={project.color} />}
            description={[
              created && "Project created.",
              documentText(project.description) || "No description added.",
            ]
              .filter(Boolean)
              .join(" ")}
          />
          <div className="project-sheet-body">
            <ProjectStatus status={project.status} />
            <dl className="project-details">
              <div>
                <dt>Owner</dt>
                <dd className="flex items-center gap-2">
                  <MemberAvatar member={owner} size="sm" />
                  {owner.name}
                </dd>
              </div>
              <div>
                <dt>Due date</dt>
                <dd>{formatDate(project.dueDate, { year: "numeric" })}</dd>
              </div>
            </dl>
            <ProjectProgress project={project} onComplete={onComplete} />
            {detailLink}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
