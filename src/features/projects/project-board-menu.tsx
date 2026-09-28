import { useRef } from "react"
import { Ellipsis } from "lucide-react"
import { Button } from "@/kit/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/kit/ui/dropdown-menu"
import {
  projectStatuses,
  statusLabels,
  type Project,
  type ProjectStatus,
} from "@/demo/model"

export function ProjectBoardMenu({
  project,
  onInspect,
  onMove,
  onReorder,
  first,
  last,
}: {
  project: Project
  onInspect: (id: string) => void
  onMove: (status: ProjectStatus) => void
  onReorder: (direction: -1 | 1) => void
  first: boolean
  last: boolean
}) {
  const handoff = useRef(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const remaining = project.tasks - project.completedTasks

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) handoff.current = false
      }}
    >
      <DropdownMenuTrigger
        ref={trigger}
        render={<Button variant="ghost" size="icon-sm" />}
        id={`project-inspect-${project.id}`}
        aria-label={`Actions for ${project.name}`}
      >
        <Ellipsis aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent finalFocus={() => !handoff.current}>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              handoff.current = true
              trigger.current?.focus({ preventScroll: true })
              onInspect(project.id)
            }}
          >
            View details
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            disabled={first}
            onClick={() => {
              handoff.current = true
              onReorder(-1)
            }}
          >
            Move up
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={last}
            onClick={() => {
              handoff.current = true
              onReorder(1)
            }}
          >
            Move down
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Move to</DropdownMenuLabel>
          {projectStatuses.map((status) => (
            <DropdownMenuItem
              key={status}
              disabled={status === project.status}
              onClick={() => {
                handoff.current = true
                onMove(status)
              }}
            >
              {statusLabels[status]}
              {status === "completed" &&
                remaining > 0 &&
                ` · finish ${remaining} tasks`}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
