import { useRef, useState, type ReactNode } from "react"
import type { DataTable } from "@/kit/data-table/table-features"
import { ProjectStatus as StatusBadge } from "@/components/project-status"
import { Badge } from "@/kit/ui/badge"
import { Button } from "@/kit/ui/button"
import { useToast } from "@/kit/ui/use-toast"
import {
  projectStatuses,
  statusLabels,
  type Member,
  type Project,
  type ProjectStatus,
} from "@/demo/model"
import type { ProjectBulkHandler } from "@/demo/project-bulk"
import { ProjectBoardCard } from "./project-board-card"
import { ProjectBoardColumn, ProjectBoardDrag } from "./project-board-drag"
import { orderBoardProjects, placeBoardProject } from "./board-order"

export function ProjectBoard({
  table,
  members,
  onInspect,
  renderName,
  onApply,
  order,
  onOrderChange,
}: {
  table: DataTable<Project>
  members: Member[]
  onInspect: (id: string) => void
  renderName?: (project: Project) => ReactNode
  onApply: ProjectBulkHandler
  order: string[]
  onOrderChange: (order: string[]) => void
}) {
  const [feedback, setFeedback] = useState<{
    message: string
    retry?: {
      id: string
      name: string
      status: ProjectStatus
      order?: string[]
    }
  } | null>(null)

  const notice = useRef<HTMLParagraphElement>(null)
  const toast = useToast()
  const rows = table.getPrePaginatedRowModel().rows

  const projects = table.state.sorting.length
    ? rows.map((row) => row.original)
    : orderBoardProjects(
        rows.map((row) => row.original),
        order,
      )

  function move(
    project: Pick<Project, "id" | "name">,
    status: ProjectStatus,
    nextOrder?: string[],
    retry = false,
  ) {
    const dragId = `project-drag-${project.id}`

    const returnId =
      document.activeElement?.id === dragId
        ? dragId
        : `project-inspect-${project.id}`

    const source = projects.find((item) => item.id === project.id)

    const result =
      source?.status === status
        ? { failed: [] }
        : onApply([project.id], { kind: "move", status }, retry)

    // The card's new column shows the result; the toast offers the way back.
    if ("undo" in result && result.undo) {
      const undo = result.undo

      const id = toast.add({
        title: `${project.name} moved to ${statusLabels[status]}`,
        type: "success",
        actionProps: {
          children: "Undo",
          onClick: () => {
            undo()
            toast.close(id)
          },
        },
      })
    }

    if (!result.failed.length && nextOrder) {
      onOrderChange(nextOrder)

      if (table.state.sorting.length) table.setSorting([])
    }

    setFeedback(
      result.failed.length
        ? {
            message: `Could not move ${project.name}. Its status has not changed.`,
            retry: {
              id: project.id,
              name: project.name,
              status,
              order: nextOrder,
            },
          }
        : { message: `${project.name} moved in ${statusLabels[status]}.` },
    )
    requestAnimationFrame(() => {
      if (result.failed.length) {
        notice.current?.focus()

        return
      }

      const target =
        document.getElementById(returnId) ?? document.getElementById("projects")

      target?.focus({ preventScroll: true })
      target?.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "instant",
      })
    })
  }

  return (
    <div className="project-board-content">
      <div className={feedback?.retry ? "project-board-feedback" : "sr-only"}>
        <p role="status" tabIndex={-1} ref={notice}>
          {feedback?.message}
        </p>
        {feedback?.retry && (
          <Button
            variant="outline"
            onClick={() => {
              const target = feedback.retry

              if (target) move(target, target.status, target.order, true)
            }}
          >
            Retry move
          </Button>
        )}
      </div>
      <ProjectBoardDrag projects={projects} members={members} onMove={move}>
        {(displayed) => (
          <div className="project-board">
            {projectStatuses.map((status) => {
              const column = displayed.filter(
                (project) => project.status === status,
              )

              return (
                <ProjectBoardColumn
                  key={status}
                  status={status}
                  projects={column}
                >
                  <header>
                    <h3>
                      <StatusBadge status={status} />
                    </h3>
                    <Badge
                      variant="count"
                      aria-label={`${column.length} projects`}
                    >
                      {column.length}
                    </Badge>
                  </header>
                  <ul>
                    {column.map((project, index) => {
                      const row = table.getRow(project.id)

                      const owner = members.find(
                        (member) => member.id === project.ownerId,
                      )

                      if (!owner)
                        throw new Error(
                          `Project ${project.id} has an unknown owner`,
                        )

                      return (
                        <ProjectBoardCard
                          key={project.id}
                          project={project}
                          owner={owner}
                          selected={row.getIsSelected()}
                          onSelect={(selected) => row.toggleSelected(selected)}
                          onInspect={onInspect}
                          onMove={(target) =>
                            move(
                              project,
                              target,
                              placeBoardProject(
                                projects,
                                project.id,
                                target,
                              ).map((item) => item.id),
                            )
                          }
                          first={index === 0}
                          last={index === column.length - 1}
                          onReorder={(direction) => {
                            const target = column[index + direction]

                            if (target)
                              move(
                                project,
                                status,
                                placeBoardProject(
                                  projects,
                                  project.id,
                                  target.id,
                                  direction === 1,
                                ).map((item) => item.id),
                              )
                          }}
                          name={renderName ? renderName(project) : project.name}
                        />
                      )
                    })}
                  </ul>
                  {column.length === 0 && (
                    <p className="project-board-empty">No projects</p>
                  )}
                </ProjectBoardColumn>
              )
            })}
          </div>
        )}
      </ProjectBoardDrag>
    </div>
  )
}
