import type { ReactNode } from "react"
import type { DataTable } from "@/kit/data-table/table-features"
import { type Member, type Project } from "@/demo/model"
import { ProjectCard } from "./project-card"

export function ProjectGrid({
  table,
  members,
  onInspect,
  renderName,
}: {
  table: DataTable<Project>
  members: Member[]
  onInspect: (id: string) => void
  renderName?: (project: Project) => ReactNode
}) {
  const selecting =
    table.getIsSomeRowsSelected() || table.getIsAllRowsSelected()

  return (
    <div
      id="project-table-scroll"
      className="project-grid-content"
      role="region"
      aria-label="Projects cards"
      tabIndex={0}
    >
      <ul className="project-grid" data-selecting={selecting || undefined}>
        {table.getRowModel().rows.map((row) => {
          const project = row.original
          const owner = members.find((member) => member.id === project.ownerId)

          if (!owner)
            throw new Error(`Project ${project.id} has an unknown owner`)

          return (
            <li
              key={row.id}
              className="project-card"
              data-selected={row.getIsSelected() || undefined}
            >
              <ProjectCard
                project={project}
                owner={owner}
                title={
                  renderName ? (
                    renderName(project)
                  ) : (
                    <button
                      type="button"
                      className="project-name"
                      data-quick-view-id={project.id}
                      onClick={() => onInspect(project.id)}
                    >
                      {project.name}
                    </button>
                  )
                }
                selection={{
                  selected: row.getIsSelected(),
                  onChange: (selected) => row.toggleSelected(selected),
                }}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
