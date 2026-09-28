import { useRef, useState, type ReactNode } from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import {
  projectStatuses,
  statusLabels,
  type Member,
  type Project,
  type ProjectStatus,
} from "@/demo/model"
import { placeBoardProject } from "./board-order"
import { ProjectBoardCardPreview } from "./project-board-card"

export function ProjectBoardDrag({
  projects,
  members,
  onMove,
  children,
}: {
  projects: Project[]
  members: Member[]
  onMove: (project: Project, status: ProjectStatus, order: string[]) => void
  children: (projects: Project[]) => ReactNode
}) {
  const [dragged, setDragged] = useState<Project | null>(null)
  const [preview, setPreview] = useState<Project[] | null>(null)
  const viewport = useRef<HTMLDivElement>(null)
  const displayed = preview ?? projects

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      scrollBehavior: "auto",
    }),
  )

  function endDrag() {
    setDragged(null)
    setPreview(null)
  }

  function returnFocus(id: string | number) {
    requestAnimationFrame(() => {
      const handle = document.getElementById(`project-drag-${id}`)
      handle?.focus({ preventScroll: true })
      handle?.closest("li")?.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "instant",
      })
    })
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={(args) => {
        const point = args.pointerCoordinates

        if (!point) return closestCenter(args)
        const bounds = viewport.current?.getBoundingClientRect()

        if (
          !bounds ||
          point.x < bounds.left ||
          point.x > bounds.right ||
          point.y < bounds.top ||
          point.y > bounds.bottom
        )
          return []
        const hits = pointerWithin(args)

        // Cards take precedence over containing lanes; empty lane space still accepts drops.
        const card = hits.find((hit) =>
          displayed.some((project) => project.id === hit.id),
        )

        return card ? [card] : hits
      }}
      accessibility={{
        restoreFocus: false,
        screenReaderInstructions: {
          draggable:
            "Press Space or Enter to pick up a project. Use arrow keys to choose a position or lane. Press Space or Enter to drop, or Escape to cancel. The Actions menu also offers move commands.",
        },
        announcements: {
          onDragStart: ({ active }) =>
            `Picked up ${projects.find((project) => project.id === active.id)?.name}. Use arrow keys to choose a position.`,
          onDragOver: ({ over }) => {
            const project = displayed.find((item) => item.id === over?.id)

            const status =
              project?.status ??
              projectStatuses.find((item) => item === over?.id)

            return project
              ? `Over ${project.name}, ${statusLabels[project.status]}.`
              : status
                ? `Over ${statusLabels[status]}.`
                : "Outside the board."
          },
          onDragEnd: () => "Drag ended.",
          onDragCancel: () => "Move cancelled.",
        },
      }}
      onDragStart={({ active }) => {
        setDragged(projects.find((item) => item.id === active.id) ?? null)
        setPreview(projects)
      }}
      onDragOver={({ active, over }) => {
        if (!over) return
        const source = displayed.find((project) => project.id === active.id)
        const target = displayed.find((project) => project.id === over.id)

        if (source?.status === (target?.status ?? over.id)) return
        const rect = active.rect.current.translated
        const after = !!rect && rect.top > over.rect.top + over.rect.height / 2
        setPreview(
          placeBoardProject(
            displayed,
            String(active.id),
            String(over.id),
            after,
          ),
        )
      }}
      onDragCancel={({ active }) => {
        endDrag()
        returnFocus(active.id)
      }}
      onDragEnd={({ active, over }) => {
        const project = projects.find((item) => item.id === active.id)
        let next = displayed

        if (project && over) {
          const from = next.findIndex((item) => item.id === active.id)
          const to = next.findIndex((item) => item.id === over.id)

          if (from >= 0 && to >= 0 && from !== to)
            next = arrayMove(next, from, to)
          else if (to < 0)
            next = placeBoardProject(next, project.id, String(over.id))
          const moved = next.find((item) => item.id === project.id)

          if (moved)
            onMove(
              project,
              moved.status,
              next.map((item) => item.id),
            )
        }

        endDrag()

        if (!project || !over) returnFocus(active.id)
      }}
    >
      <div
        ref={viewport}
        id="project-table-scroll"
        className="project-board-scroll"
        role="region"
        aria-label="Project board, scroll horizontally for all statuses"
        tabIndex={0}
        hidden={projects.length === 0}
      >
        {children(displayed)}
      </div>
      <DragOverlay dropAnimation={null}>
        {dragged && (
          <ProjectBoardCardPreview
            project={dragged}
            owner={members.find((member) => member.id === dragged.ownerId)}
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}

export function ProjectBoardColumn({
  status,
  projects,
  children,
}: {
  status: ProjectStatus
  projects: Project[]
  children: ReactNode
}) {
  const { setNodeRef, isOver, active } = useDroppable({ id: status })

  return (
    <section
      ref={setNodeRef}
      className="project-board-column"
      data-status={status}
      data-dragging={Boolean(active)}
      data-over={isOver}
    >
      <SortableContext
        items={projects.map((project) => project.id)}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </section>
  )
}
