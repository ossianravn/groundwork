import type { ReactNode } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Ellipsis } from "lucide-react"
import { Button } from "@/kit/ui/button"
import type { Member, Project, ProjectStatus } from "@/demo/model"
import { ProjectCard } from "./project-card"
import { ProjectBoardContextMenu, ProjectBoardMenu } from "./project-board-menu"

export function ProjectBoardCard({
  project,
  owner,
  selected,
  onSelect,
  onInspect,
  onMove,
  onReorder,
  first,
  last,
  name,
}: {
  project: Project
  owner: Member
  selected: boolean
  onSelect: (selected: boolean) => void
  onInspect: (id: string) => void
  onMove: (status: ProjectStatus) => void
  onReorder: (direction: -1 | 1) => void
  first: boolean
  last: boolean
  name: ReactNode
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    isDragging,
    transform,
    transition,
  } = useSortable({
    id: project.id,
    // Neighbours make room on the drop's curve (--ease-standard).
    transition: { duration: 200, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
  })

  const actions = { project, onInspect, onMove, onReorder, first, last }

  return (
    <ProjectBoardContextMenu
      {...actions}
      card={
        <li
          ref={setNodeRef}
          className="project-card project-board-card"
          data-density="board"
          data-selected={selected || undefined}
          data-dragging={isDragging}
          style={{ transform: CSS.Transform.toString(transform), transition }}
        />
      }
    >
      <ProjectCard
        project={project}
        owner={owner}
        title={name}
        density="board"
        selection={{ selected, onChange: onSelect }}
        actions={
          <>
            <Button
              ref={setActivatorNodeRef}
              id={`project-drag-${project.id}`}
              variant="ghost"
              size="icon-sm"
              className="project-board-drag-handle"
              {...attributes}
              {...listeners}
              aria-label={`Move ${project.name}`}
              title="Drag to reorder or change status"
            >
              <GripVertical aria-hidden="true" />
            </Button>
            <ProjectBoardMenu {...actions} />
          </>
        }
      />
    </ProjectBoardContextMenu>
  )
}

export function ProjectBoardCardPreview({
  project,
  owner,
}: {
  project: Project
  owner: Member | undefined
}) {
  if (!owner) return null

  return (
    <div
      className="project-card project-board-card project-board-drag-preview"
      data-density="board"
      aria-hidden="true"
    >
      <ProjectCard
        project={project}
        owner={owner}
        title={<span className="project-name">{project.name}</span>}
        density="board"
        actions={<Ellipsis size={16} />}
      />
    </div>
  )
}
