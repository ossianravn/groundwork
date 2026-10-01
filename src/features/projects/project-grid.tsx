import { RadialProgress } from "@/kit/ui/radial-progress"
import { hueColor } from "@/kit/ui/chart-colors"
import { documentText } from "@/kit/rich-text/document"
import type { ReactNode } from "react"
import { ArrowUpRight } from "lucide-react"
import type { DataTable } from "@/kit/data-table/table-features"
import { MemberAvatar } from "@/kit/member-avatar"
import { ProjectDueDate } from "@/components/project-due-date"
import { ProjectStatus } from "@/components/project-status"
import { Button } from "@/kit/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/kit/ui/card"
import { Checkbox } from "@/kit/ui/checkbox"
import { type Member, type Project } from "@/demo/model"

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
  return (
    <div
      id="project-table-scroll"
      className="project-grid-content"
      role="region"
      aria-label="Projects cards"
      tabIndex={0}
    >
      <ul className="project-grid">
        {table.getRowModel().rows.map((row) => {
          const project = row.original
          const owner = members.find((member) => member.id === project.ownerId)

          if (!owner)
            throw new Error(`Project ${project.id} has an unknown owner`)

          const percent = project.tasks
            ? Math.round((project.completedTasks / project.tasks) * 100)
            : 0

          return (
            <li key={row.id}>
              <Card
                className="project-grid-card"
                data-selected={row.getIsSelected()}
              >
                <CardHeader>
                  <div className="project-grid-status">
                    <ProjectStatus status={project.status} />
                    <Checkbox
                      aria-label={`Select ${project.name}`}
                      checked={row.getIsSelected()}
                      onCheckedChange={(checked) => row.toggleSelected(checked)}
                    />
                  </div>
                  <CardTitle>
                    <h3>
                      {renderName ? (
                        renderName(project)
                      ) : (
                        <Button
                          variant="link"
                          onClick={() => onInspect(project.id)}
                        >
                          {project.name}
                        </Button>
                      )}
                    </h3>
                  </CardTitle>
                  {documentText(project.description) && (
                    <CardDescription className="line-clamp-2">
                      {documentText(project.description)}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="project-grid-progress">
                  <RadialProgress
                    value={percent}
                    color={hueColor(project.color)}
                    label={`${project.name}: ${percent}% complete`}
                  >
                    {percent}%
                  </RadialProgress>
                  <span>
                    {project.completedTasks} of {project.tasks} tasks done
                  </span>
                </CardContent>
                <CardFooter className="project-grid-footer">
                  <span className="owner-cell">
                    <MemberAvatar member={owner} size="sm" />
                    <span>{owner.name}</span>
                  </span>
                  <span className="project-grid-due">
                    <ProjectDueDate date={project.dueDate} />
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    id={`project-inspect-${project.id}`}
                    aria-label={`Inspect ${project.name}`}
                    onClick={() => onInspect(project.id)}
                  >
                    <ArrowUpRight aria-hidden="true" />
                  </Button>
                </CardFooter>
              </Card>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
