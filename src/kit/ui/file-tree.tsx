import * as React from "react"
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react"
import { cn } from "cn"

export interface FileNode {
  name: string
  /** Unique; used for selection and expansion. */
  path: string
  /** Present for folders. */
  children?: FileNode[]
  status?: "added" | "modified" | "deleted"
}

interface VisibleNode {
  node: FileNode
  level: number
  parent?: string
  position: number
  size: number
}

const statuses = {
  added: { letter: "A", label: "added", className: "text-(--success)" },
  modified: { letter: "M", label: "modified", className: "text-(--warning)" },
  deleted: { letter: "D", label: "deleted", className: "text-destructive" },
}

function visible(
  nodes: FileNode[],
  expanded: Set<string>,
  level = 1,
  parent?: string,
) {
  return nodes.flatMap((node, index): VisibleNode[] => [
    { node, level, parent, position: index + 1, size: nodes.length },
    ...(node.children && expanded.has(node.path)
      ? visible(node.children, expanded, level + 1, node.path)
      : []),
  ])
}

/**
 * A folder and file hierarchy with the tree keyboard pattern: arrows move
 * and open, Home and End jump, Enter or Space selects a file or toggles a
 * folder. Only one row is in the tab order. Changed files are marked with
 * a letter that is also spoken.
 */
function FileTree({
  nodes,
  label,
  selected,
  onSelect,
  defaultExpanded = [],
  className,
}: {
  nodes: FileNode[]
  label: string
  selected?: string
  onSelect?: (path: string) => void
  /** Folder paths open at first. */
  defaultExpanded?: string[]
  className?: string
}) {
  const [expanded, setExpanded] = React.useState(() => new Set(defaultExpanded))
  const rows = visible(nodes, expanded)
  const [focused, setFocused] = React.useState(selected ?? rows[0]?.node.path)
  const refs = React.useRef(new Map<string, HTMLLIElement>())

  const current = rows.some((row) => row.node.path === focused)
    ? focused
    : rows[0]?.node.path

  const focus = (path: string | undefined) => {
    if (!path) return

    setFocused(path)
    refs.current.get(path)?.focus()
  }

  const toggle = (path: string, open: boolean) =>
    setExpanded((set) => {
      const next = new Set(set)

      if (open) next.add(path)
      else next.delete(path)

      return next
    })

  function keyDown(
    event: React.KeyboardEvent,
    row: VisibleNode,
    index: number,
  ) {
    const folder = !!row.node.children
    const open = expanded.has(row.node.path)

    const activate = () =>
      folder ? toggle(row.node.path, !open) : onSelect?.(row.node.path)

    switch (event.key) {
      case "ArrowDown":
        focus(rows[index + 1]?.node.path)
        break
      case "ArrowUp":
        focus(rows[index - 1]?.node.path)
        break
      case "Home":
        focus(rows[0]?.node.path)
        break
      case "End":
        focus(rows[rows.length - 1]?.node.path)
        break
      case "ArrowRight":
        if (folder && open) focus(rows[index + 1]?.node.path)
        else if (folder) toggle(row.node.path, true)
        break
      case "ArrowLeft":
        if (folder && open) toggle(row.node.path, false)
        else focus(row.parent)
        break
      case "Enter":
      case " ":
        activate()
        break
      default:
        return
    }

    event.preventDefault()
  }

  return (
    <ul
      role="tree"
      aria-label={label}
      data-slot="file-tree"
      className={cn("grid font-mono text-[0.8125rem]", className)}
    >
      {rows.map((row, index) => {
        const { node } = row
        const folder = !!node.children
        const open = expanded.has(node.path)
        const status = node.status && statuses[node.status]

        return (
          <li
            key={node.path}
            ref={(element) => {
              if (element) refs.current.set(node.path, element)
              else refs.current.delete(node.path)
            }}
            role="treeitem"
            aria-level={row.level}
            aria-posinset={row.position}
            aria-setsize={row.size}
            aria-expanded={folder ? open : undefined}
            aria-selected={folder ? undefined : node.path === selected}
            tabIndex={node.path === current ? 0 : -1}
            onFocus={() => setFocused(node.path)}
            onKeyDown={(event) => keyDown(event, row, index)}
            onClick={() =>
              folder ? toggle(node.path, !open) : onSelect?.(node.path)
            }
            style={{
              paddingInlineStart: `calc(${row.level - 1} * 1rem + 0.5rem)`,
            }}
            className="flex min-h-(--control-height-sm) cursor-default items-center gap-1.5 rounded-md pe-2 outline-none select-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 aria-selected:bg-accent aria-selected:font-medium"
          >
            <ChevronRight
              className={cn(
                "size-3.5 shrink-0 text-muted-foreground transition-transform",
                !folder && "invisible",
                open && "rotate-90",
              )}
              aria-hidden="true"
            />
            {folder ? (
              open ? (
                <FolderOpen
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              ) : (
                <Folder
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              )
            ) : (
              <File
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            )}
            <span className="min-w-0 flex-1 truncate">{node.name}</span>
            {status && (
              <span className={cn("text-xs font-semibold", status.className)}>
                <span aria-hidden="true">{status.letter}</span>
                <span className="sr-only">, {status.label}</span>
              </span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export { FileTree }
