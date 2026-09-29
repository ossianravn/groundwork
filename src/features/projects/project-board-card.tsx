import { ProjectProgressBar } from "@/components/project-progress-bar"
import type { ReactNode } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Ellipsis } from "lucide-react"
import { MemberAvatar } from "@/kit/member-avatar"
import { ProjectDueDate } from "@/components/project-due-date"
import { Button } from "@/kit/ui/button"
import { Checkbox } from "@/kit/ui/checkbox"
import type { Member, Project, ProjectStatus } from "@/demo/model"
import { ProjectBoardContextMenu, ProjectBoardMenu } from "./project-board-menu"

function BoardCardContent({
  project,
  owner,
  name,
  selection,
  actions,
}: {
  project: Project
  owner: Member
  name: ReactNode
  selection: ReactNode
  actions: ReactNode
}) {
  const percent = project.tasks
    ? Math.round((project.completedTasks / project.tasks) * 100)
    : 0

  return (
    <>
      <div className="project-board-card-heading">
        {selection}
        <h4>{name}</h4>
        <div className="project-board-card-actions">{actions}</div>
      </div>
      <div className="project-board-progress">
        <div>
          <span>
            {project.completedTasks} / {project.tasks} tasks
          </span>
          <span>{percent}%</span>
        </div>
        <ProjectProgressBar
          color={project.color}
          value={percent}
          label={`${project.name}: ${percent}% complete`}
        />
      </div>
      <footer>
        <span className="owner-cell">
          <MemberAvatar member={owner} size="sm" />
          <span>{owner.name}</span>
        </span>
        <ProjectDueDate date={project.dueDate} />
      </footer>
    </>
  )
}

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
  } = useSortable({ id: project.id })

  const actions = { project, onInspect, onMove, onReorder, first, last }

  return (
    <ProjectBoardContextMenu
      {...actions}
      card={
        <li
          ref={setNodeRef}
          className="project-board-card"
          data-selected={selected}
          data-dragging={isDragging}
          style={{ transform: CSS.Transform.toString(transform), transition }}
        />
      }
    >
      <BoardCardContent
        project={project}
        owner={owner}
        name={name}
        selection={
          <Checkbox
            aria-label={`Select ${project.name}`}
            checked={selected}
            onCheckedChange={onSelect}
          />
        }
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
      className="project-board-card project-board-drag-preview"
      aria-hidden="true"
    >
      <BoardCardContent
        project={project}
        owner={owner}
        name={<span className="font-semibold">{project.name}</span>}
        selection={<span className="project-board-checkbox-preview" />}
        actions={<Ellipsis size={16} />}
      />
    </div>
  )
}
