import type { ReactElement, ReactNode } from "react"
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
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/kit/ui/context-menu"
import {
  projectStatuses,
  statusLabels,
  type Project,
  type ProjectStatus,
} from "@/demo/model"
import { useMenuHandoff } from "./use-menu-handoff"

interface BoardActionsProps {
  project: Project
  onInspect: (id: string) => void
  onMove: (status: ProjectStatus) => void
  onReorder: (direction: -1 | 1) => void
  first: boolean
  last: boolean
}

// One action list for the card's menu button and its context menu. An action
// hands focus on (to the inspector or the moved card), so the closing menu
// must not pull it back.
function BoardActions({
  project,
  onInspect,
  onMove,
  onReorder,
  first,
  last,
  onHandOff,
}: BoardActionsProps & { onHandOff: () => void }) {
  const remaining = project.tasks - project.completedTasks

  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuItem
          onClick={() => {
            onHandOff()
            // The inspector returns focus to the card's menu button.
            document
              .getElementById(`project-inspect-${project.id}`)
              ?.focus({ preventScroll: true })
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
            onHandOff()
            onReorder(-1)
          }}
        >
          Move up
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={last}
          onClick={() => {
            onHandOff()
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
              onHandOff()
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
    </>
  )
}

export function ProjectBoardMenu(props: BoardActionsProps) {
  const menu = useMenuHandoff(props.onInspect)

  return (
    <DropdownMenu onOpenChange={menu.onOpenChange}>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-sm" />}
        id={`project-inspect-${props.project.id}`}
        aria-label={`Actions for ${props.project.name}`}
      >
        <Ellipsis aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent finalFocus={menu.finalFocus}>
        <BoardActions {...props} onHandOff={menu.handOff} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** The same actions on right-click, long press or the context-menu key. */
export function ProjectBoardContextMenu({
  card,
  children,
  ...props
}: BoardActionsProps & { card: ReactElement; children: ReactNode }) {
  const menu = useMenuHandoff(props.onInspect)

  return (
    <ContextMenu
      onOpenChange={menu.onOpenChange}
      onOpenChangeComplete={menu.onOpenChangeComplete}
    >
      <ContextMenuTrigger render={card}>{children}</ContextMenuTrigger>
      <ContextMenuContent
        aria-label={`Actions for ${props.project.name}`}
        finalFocus={menu.finalFocus}
      >
        <BoardActions
          {...props}
          onInspect={menu.inspectAfterClose}
          onHandOff={menu.handOff}
        />
      </ContextMenuContent>
    </ContextMenu>
  )
}
