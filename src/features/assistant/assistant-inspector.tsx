import { useSyncExternalStore, type ReactNode } from "react"
import { X } from "lucide-react"
import { Button } from "@/kit/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/kit/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/kit/ui/tabs"
import type { RenderResponseLink } from "@/kit/ai/response-link"
import type { AssistantMessage } from "@/demo/assistant/assistant-types"
import { AssistantOutputs, AssistantSources } from "./assistant-outputs"
import { AssistantWork } from "./assistant-work"
import { workTurns } from "./inspector-model"
import { workOutputs, workSources } from "./inspector-outputs"

export type InspectorTab = "work" | "outputs" | "sources"

const isTab = (value: unknown): value is InspectorTab =>
  value === "work" || value === "outputs" || value === "sources"

// Matches the width at which assistant.css gives the panel its own column.
const besideChat = "(width >= 84rem)"

function subscribe(callback: () => void) {
  const query = matchMedia(besideChat)

  query.addEventListener("change", callback)

  return () => query.removeEventListener("change", callback)
}

const isBeside = () => matchMedia(besideChat).matches

/** Scrolls the transcript to a reply and marks it for a moment. */
function showInConversation(messageId: string) {
  const item = document.querySelector<HTMLElement>(
    `[data-message-id="${messageId}"]`,
  )

  if (!item) return

  item.scrollIntoView({ block: "start" })
  item.dataset.highlight = ""
  window.setTimeout(() => delete item.dataset.highlight, 1600)
}

/**
 * The conversation at a glance: Work (what the assistant did, question by
 * question), Outputs (answers, drafts and changes) and Sources (pages cited).
 * Items lead back to their place in the transcript. It sits beside the
 * chat on wide screens and opens as a sheet on narrower ones.
 */
export function AssistantInspector({
  open,
  messages,
  stopped,
  posted,
  tab,
  focus,
  renderLink,
  onTabChange,
  onClose,
}: {
  open: boolean
  messages: AssistantMessage[]
  stopped: string[]
  posted: string[]
  tab: InspectorTab
  /** A reply whose work to show, set when its reasoning is opened. */
  focus?: { messageId: string; key: number }
  renderLink: RenderResponseLink
  onTabChange: (tab: InspectorTab) => void
  onClose: () => void
}) {
  const beside = useSyncExternalStore(subscribe, isBeside, () => true)
  const turns = workTurns(messages, stopped)
  const outputs = workOutputs(messages, posted)
  const sources = workSources(messages)

  const show = (messageId: string) => {
    if (!beside) onClose()

    requestAnimationFrame(() => showInConversation(messageId))
  }

  const tab_ = (value: InspectorTab, label: string, count: number) => (
    <TabsTrigger value={value}>
      {label} <span className="assistant-inspector-count">{count}</span>
    </TabsTrigger>
  )

  const body: ReactNode = (
    <Tabs
      className="assistant-inspector-tabs"
      value={tab}
      onValueChange={(value) => {
        if (isTab(value)) onTabChange(value)
      }}
    >
      <TabsList variant="line" aria-label="Conversation details">
        {tab_("work", "Work", turns.length)}
        {tab_("outputs", "Outputs", outputs.length)}
        {tab_("sources", "Sources", sources.length)}
      </TabsList>
      <TabsContent value="work" className="assistant-inspector-panel">
        <AssistantWork turns={turns} focus={focus} onShow={show} />
      </TabsContent>
      <TabsContent value="outputs" className="assistant-inspector-panel">
        <AssistantOutputs
          outputs={outputs}
          renderLink={renderLink}
          onShow={show}
        />
      </TabsContent>
      <TabsContent value="sources" className="assistant-inspector-panel">
        <AssistantSources sources={sources} renderLink={renderLink} />
      </TabsContent>
    </Tabs>
  )

  if (!beside)
    return (
      <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
        <SheetContent side="right" className="assistant-inspector-sheet">
          <SheetHeader>
            <SheetTitle>Conversation</SheetTitle>
            <SheetDescription className="sr-only">
              What the assistant did, made and cited in this conversation.
            </SheetDescription>
          </SheetHeader>
          {body}
        </SheetContent>
      </Sheet>
    )

  if (!open) return null

  return (
    <aside
      id="assistant-inspector"
      className="assistant-inspector"
      aria-labelledby="assistant-inspector-title"
    >
      <header className="assistant-inspector-header">
        <h2 id="assistant-inspector-title">Conversation</h2>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Close conversation panel"
          onClick={onClose}
        >
          <X aria-hidden="true" />
        </Button>
      </header>
      {body}
    </aside>
  )
}
