import { useState } from "react"
import { Copy, Download, Pencil } from "lucide-react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuTrigger,
} from "@/kit/ui/context-menu"

export function ContextMenuExample() {
  const [last, setLast] = useState("")

  return (
    <div className="grid max-w-sm gap-2">
      <ContextMenu>
        <ContextMenuTrigger
          tabIndex={0}
          className="grid h-28 place-items-center rounded-lg border border-dashed text-sm text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Right-click or long-press brief.pdf
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuGroup>
            <ContextMenuLabel>brief.pdf</ContextMenuLabel>
            <ContextMenuItem onClick={() => setLast("Renamed brief.pdf")}>
              <Pencil aria-hidden="true" />
              Rename
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setLast("Duplicated brief.pdf")}>
              <Copy aria-hidden="true" />
              Duplicate
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setLast("Downloaded brief.pdf")}>
              <Download aria-hidden="true" />
              Download
            </ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      </ContextMenu>
      <p role="status" className="min-h-5 text-sm text-muted-foreground">
        {last}
      </p>
    </div>
  )
}
