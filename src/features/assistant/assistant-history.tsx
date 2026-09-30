import { useState } from "react"
import { Ellipsis, History, PanelLeftClose, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/kit/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/kit/ui/dropdown-menu"
import { Input } from "@/kit/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/kit/ui/sheet"
import { PageAction, PageActions } from "@/kit/shell/page-actions"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/kit/ui/tooltip"

export interface HistoryItem {
  id: string
  title: string
}

interface HistoryProps {
  items: HistoryItem[]
  activeId: string
  onSelect: (id: string) => void
  onRename: (id: string, title: string) => void
  onDelete: (id: string) => void
}

const rowId = (id: string) => `assistant-history-${id}`

/** Past conversations: open one, rename it in place, or delete it. */
function HistoryList({
  items,
  activeId,
  onSelect,
  onRename,
  onDelete,
}: HistoryProps) {
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState("")

  const finish = (id: string, save: boolean) => {
    if (save) onRename(id, draft)

    setEditing(null)
    requestAnimationFrame(() => document.getElementById(rowId(id))?.focus())
  }

  if (!items.length)
    return (
      <p className="px-3 py-2 text-sm text-muted-foreground">
        Conversations you start appear here.
      </p>
    )

  return (
    <ul className="assistant-history-list">
      {items.map((item) => (
        <li key={item.id} data-active={item.id === activeId || undefined}>
          {editing === item.id ? (
            <Input
              autoFocus
              aria-label="Conversation name"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={() => finish(item.id, true)}
              onKeyDown={(event) => {
                if (event.key === "Enter") finish(item.id, true)

                if (event.key === "Escape") {
                  event.preventDefault()
                  finish(item.id, false)
                }
              }}
            />
          ) : (
            <>
              <button
                id={rowId(item.id)}
                type="button"
                className="assistant-history-item"
                aria-current={item.id === activeId ? "page" : undefined}
                onClick={() => onSelect(item.id)}
              >
                {item.title}
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="assistant-history-menu"
                      aria-label={`Actions for ${item.title}`}
                    />
                  }
                >
                  <Ellipsis aria-hidden="true" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setDraft(item.title)
                      setEditing(item.id)
                    }}
                  >
                    <Pencil aria-hidden="true" /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => {
                      onDelete(item.id)
                      // The row is gone; the next question starts in the composer.
                      requestAnimationFrame(() =>
                        document.getElementById("assistant-prompt")?.focus(),
                      )
                    }}
                  >
                    <Trash2 aria-hidden="true" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </li>
      ))}
    </ul>
  )
}

// Matches the width at which assistant.css shows history beside the chat.
const besideChat = "(width >= 72rem)"

const focusById = (id: string) =>
  requestAnimationFrame(() => document.getElementById(id)?.focus())

/**
 * History beside the chat on wide screens, where it can be hidden for the
 * session; a History action in the top bar brings it back. On narrower
 * screens that action opens it in a sheet, which closes once a chat is
 * chosen.
 */
export function AssistantHistory(props: HistoryProps) {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)

  function show() {
    if (!window.matchMedia(besideChat).matches) {
      setOpen(true)

      return
    }

    setHidden(false)
    focusById("assistant-history-hide")
  }

  return (
    <>
      <nav
        id="assistant-history"
        className="assistant-history"
        aria-label="Conversations"
        hidden={hidden}
      >
        <div className="assistant-history-header">
          <h2 className="assistant-history-title">History</h2>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  id="assistant-history-hide"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Hide history"
                  onClick={() => {
                    setHidden(true)
                    // The button hides with the panel; its opposite takes focus.
                    focusById("assistant-history-show")
                  }}
                />
              }
            >
              <PanelLeftClose aria-hidden="true" />
            </TooltipTrigger>
            <TooltipContent>Hide history</TooltipContent>
          </Tooltip>
        </div>
        <HistoryList {...props} />
      </nav>
      <PageActions>
        <PageAction
          id="assistant-history-show"
          className="page-action assistant-history-action"
          data-history-hidden={hidden || undefined}
          variant="outline"
          icon={History}
          label="History"
          onClick={show}
        />
      </PageActions>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="assistant-history-sheet">
          <SheetHeader>
            <SheetTitle>History</SheetTitle>
          </SheetHeader>
          <HistoryList
            {...props}
            onSelect={(id) => {
              props.onSelect(id)
              setOpen(false)
            }}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
