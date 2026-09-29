import { ProjectProgressBar } from "@/components/project-progress-bar"
import { dataTableFeatures } from "@/kit/data-table/table-features"
import type { ColumnDef } from "@tanstack/react-table"
import type { ReactNode } from "react"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { MemberAvatar } from "@/kit/member-avatar"
import { ProjectMark } from "@/components/project-identity"
import { ProjectStatus } from "@/components/project-status"
import {
  formatDate,
  statusLabels,
  type Member,
  type Project,
} from "@/demo/model"

// Rem-based minimums preserve useful columns as fonts/zoom change. The name
// column receives the remaining width; filtering never remeasures its content.
export const projectColumnWidths = {
  selection: 3,
  name: 15,
  status: 9.5,
  progress: 9.5,
  owner: 7.5,
  dueDate: 7,
  actions: 4,
}

type ProjectColumnId = keyof typeof projectColumnWidths

type ProjectColumn = ColumnDef<typeof dataTableFeatures, Project> &
  (
    | { id: ProjectColumnId; accessorKey?: ProjectColumnId }
    | { id?: ProjectColumnId; accessorKey: ProjectColumnId }
  )

export function projectColumns(
  members: Member[],
  onSelect: (id: string) => void,
  renderName?: (project: Project) => ReactNode,
): ProjectColumn[] {
  function ownerFor(project: Project) {
    const member = members.find((member) => member.id === project.ownerId)

    if (!member) throw new Error(`Project ${project.id} has an unknown owner`)

    return member
  }

  return [
    {
      accessorKey: "name",
      header: "Project name",
      enableHiding: false,
      cell: ({ row: { original: project } }) => (
        <div className="flex items-center gap-3">
          <ProjectMark color={project.color} />
          {renderName ? (
            renderName(project)
          ) : (
            <Button
              variant="ghost"
              className="project-name"
              title={project.name}
              id={`project-link-${project.id}`}
              onClick={() => onSelect(project.id)}
            >
              <span className="truncate">{project.name}</span>
            </Button>
          )}
        </div>
      ),
    },
    {
      id: "status",
      accessorFn: (project) => statusLabels[project.status],
      header: "Status",
      cell: ({ row }) => <ProjectStatus status={row.original.status} />,
    },
    {
      id: "progress",
      header: "Progress",
      accessorFn: (project) =>
        project.tasks ? project.completedTasks / project.tasks : 0,
      cell: ({ row: { original: project } }) => {
        if (!project.tasks)
          return <span className="text-muted-foreground">No tasks</span>

        const percent = Math.round(
          (project.completedTasks / project.tasks) * 100,
        )

        return (
          <div className="progress-cell">
            <ProjectProgressBar
              color={project.color}
              value={percent}
              label={`${project.name}: ${percent}% complete`}
              className="w-18"
            />
            <span>{percent}%</span>
          </div>
        )
      },
    },
    {
      id: "owner",
      accessorFn: (project) => ownerFor(project).name,
      header: "Owner",
      cell: ({ row }) => {
        const owner = ownerFor(row.original)

        return (
          <span className="owner-cell">
            <MemberAvatar member={owner} size="sm" />
            <span>{owner.name.split(" ")[0]}</span>
          </span>
        )
      },
    },
    {
      accessorKey: "dueDate",
      header: "Due date",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {formatDate(row.original.dueDate)}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon-sm"
          id={`project-inspect-${row.original.id}`}
          aria-label={`Inspect ${row.original.name}`}
          onClick={() => onSelect(row.original.id)}
        >
          <ArrowUpRight aria-hidden="true" />
        </Button>
      ),
    },
  ]
}
