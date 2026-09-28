import { useRef, useSyncExternalStore, type ReactNode } from "react"
import type { GroupImperativeHandle } from "react-resizable-panels"
import { MoreHorizontal, RotateCcw, CheckCheck, SquarePen } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { PageAction, PageActions } from "@/kit/shell/page-actions"
import { ToggleGroup, ToggleGroupItem } from "@/kit/ui/toggle-group"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/kit/ui/dropdown-menu"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/kit/ui/resizable"
import type { InboxFilter } from "@/demo/use-inbox"

const wideQuery = "(min-width: 64rem)"

function subscribe(callback: () => void) {
  const query = matchMedia(wideQuery)
  query.addEventListener("change", callback)

  return () => query.removeEventListener("change", callback)
}

function isWide() {
  return matchMedia(wideQuery).matches
}

export function InboxLayout({
  list,
  detail,
  filter,
  unreadCount,
  selected,
  onFilter,
  onReadAll,
  failure,
  onCompose,
}: {
  list: ReactNode
  detail: ReactNode
  filter: InboxFilter
  unreadCount: number
  selected: boolean
  onFilter: (filter: InboxFilter) => void
  onReadAll: () => void
  failure: ReactNode
  onCompose: () => void
}) {
  const wide = useSyncExternalStore(subscribe, isWide, () => false)
  const group = useRef<GroupImperativeHandle>(null)

  return (
    <main id="main-content" tabIndex={-1} className="inbox-page">
      <h1 className="sr-only">Inbox</h1>
      <PageActions>
        <PageAction
          id="inbox-compose"
          icon={SquarePen}
          label="New message"
          onClick={onCompose}
        />
      </PageActions>
      <section className="inbox-surface" aria-label="Inbox messages">
        <div className="inbox-toolbar">
          <ToggleGroup
            variant="outline"
            spacing={0}
            value={[filter]}
            aria-label="Filter messages"
            onValueChange={(values) => {
              if (values[0]) onFilter(values[0] === "unread" ? "unread" : "all")
            }}
          >
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            <ToggleGroupItem value="unread">
              Unread {unreadCount ? `(${unreadCount})` : ""}
            </ToggleGroupItem>
          </ToggleGroup>
          <div className="inbox-toolbar-actions">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Inbox actions"
                  />
                }
              >
                <MoreHorizontal aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem disabled={!unreadCount} onClick={onReadAll}>
                    <CheckCheck aria-hidden="true" /> Mark all read
                  </DropdownMenuItem>
                  {wide && (
                    <DropdownMenuItem
                      onClick={() =>
                        group.current?.setLayout({ messages: 38, reading: 62 })
                      }
                    >
                      <RotateCcw aria-hidden="true" /> Reset panel sizes
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {failure}
        {wide ? (
          <div className="inbox-panes">
            <ResizablePanelGroup groupRef={group} orientation="horizontal">
              <ResizablePanel
                id="messages"
                defaultSize="38%"
                minSize="30%"
                maxSize="55%"
              >
                <div
                  className="inbox-list-scroll"
                  id="inbox-list"
                  data-scroll-restoration-id="inbox-list"
                >
                  {list}
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle aria-label="Resize message list" />
              <ResizablePanel id="reading" minSize="45%">
                <div className="inbox-detail-scroll">{detail}</div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        ) : selected ? (
          detail
        ) : (
          list
        )}
      </section>
    </main>
  )
}
