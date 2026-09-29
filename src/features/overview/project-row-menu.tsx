import type { ReactElement, ReactNode } from "react"
import type { DataTable } from "@/kit/data-table/table-features"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/kit/ui/context-menu"
import type { Project } from "@/demo/model"
import { useMenuHandoff } from "@/features/projects/use-menu-handoff"

export type ProjectRow = ReturnType<
  DataTable<Project>["getRowModel"]
>["rows"][number]

// Right-click, long press or the context-menu key on a table row offers the
// row's own actions: the same inspector and page the row links to, and
// selection for the bulk actions. Nothing here is only reachable this way.
export function ProjectRowMenu({
  row,
  rowElement,
  children,
  onInspect,
  onOpen,
  selectable,
}: {
  row: ProjectRow
  /** The table row element the menu opens over, and its cells. */
  rowElement: ReactElement
  children: ReactNode
  onInspect: (id: string) => void
  onOpen: (id: string) => void
  selectable: boolean
}) {
  const menu = useMenuHandoff(onInspect)
  const project = row.original

  return (
    <ContextMenu
      onOpenChange={menu.onOpenChange}
      onOpenChangeComplete={menu.onOpenChangeComplete}
    >
      <ContextMenuTrigger render={rowElement}>{children}</ContextMenuTrigger>
      <ContextMenuContent
        aria-label={`Actions for ${project.name}`}
        finalFocus={menu.finalFocus}
      >
        <ContextMenuGroup>
          <ContextMenuItem onClick={() => menu.inspectAfterClose(project.id)}>
            View details
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => {
              menu.handOff()
              onOpen(project.id)
            }}
          >
            Open project
          </ContextMenuItem>
        </ContextMenuGroup>
        {selectable && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => row.toggleSelected()}>
              {row.getIsSelected() ? "Deselect" : "Select"}
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
