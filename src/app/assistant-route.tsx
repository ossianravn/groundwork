import { useEffect, useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { PanelRight } from "lucide-react"
import { useToast } from "@/kit/ui/use-toast"
import { PageAction, PageActions } from "@/kit/shell/page-actions"
import { models } from "@/demo/assistant/assistant-model"
import { conversationTitle } from "@/demo/assistant/use-assistant"
import script from "@/demo/data/assistant.json"
import { AssistantChat } from "@/features/assistant/assistant-chat"
import { AssistantHistory } from "@/features/assistant/assistant-history"
import {
  AssistantInspector,
  type InspectorTab,
} from "@/features/assistant/assistant-inspector"
import { plainText } from "@/features/assistant/assistant-text"
import { contextUsage, messageParts, modelIds } from "./assistant-parts"
import { ReplyLink } from "./assistant-reply-link"
import { useDemoState } from "./demo-state"
import { useAssistantSession } from "./use-assistant-session"
import { useRouteFocus } from "./use-route-focus"

export function AssistantRoute() {
  const { demo, assistant } = useDemoState()
  const search = useSearch({ from: "/app/demo/assistant" })
  const navigate = useNavigate()

  // A question brought in the URL starts the composer once, then leaves the
  // address, so reloading or switching chats does not bring it back.
  const [initialDraft] = useState(search.q)

  useEffect(() => {
    if (search.q)
      void navigate({
        to: "/app/demo/assistant",
        search: { ...search, q: "" },
        replace: true,
      })
  }, [navigate, search])
  const toast = useToast()
  const session = useAssistantSession()
  const { messages, setMessages, status, request, conversation } = session

  useRouteFocus()

  // The conversation panel: opened by its top-bar action, or at a reply's
  // work from that reply's reasoning.
  const [inspector, setInspector] = useState<{
    open: boolean
    tab: InspectorTab
    focus?: { messageId: string; key: number }
  }>({ open: false, tab: "work" })

  const closeInspector = () => {
    setInspector((state) => ({ ...state, open: false }))
    requestAnimationFrame(() =>
      document.getElementById("assistant-panel-toggle")?.focus(),
    )
  }

  const last = messages.at(-1)
  const question = messages.at(-2)

  // Regenerate keeps the reply it replaces, so the latest answer can move
  // between versions. Choosing one makes it the reply the chat continues.
  const kept =
    question && last?.role === "assistant"
      ? (conversation.versions[question.id] ?? [])
      : []

  const versions =
    last && kept.length
      ? kept.some((reply) => reply.id === last.id)
        ? kept
        : [...kept, last]
      : []

  const keepLatest = () => {
    if (question && last?.role === "assistant")
      assistant.keepVersion(conversation.id, question.id, last)
  }

  function restore(messageId: string) {
    const index = messages.findIndex((message) => message.id === messageId)
    const snapshot = messages

    if (status === "submitted" || status === "streaming") void session.stop()

    setMessages(messages.slice(0, index))

    const acted = snapshot
      .slice(index)
      .some((message) =>
        message.parts.some(
          (part) =>
            part.type === "tool-createTasks" &&
            part.state === "output-available",
        ),
      )

    const id = toast.add({
      title: "Conversation restored",
      description: acted
        ? "Tasks the assistant added stay in their projects."
        : undefined,
      actionProps: {
        children: "Undo",
        onClick: () => {
          setMessages(snapshot)
          toast.close(id)
        },
      },
    })
  }

  function remove(id: string) {
    const { removed, index } = assistant.remove(id)

    if (!removed) return

    const toastId = toast.add({
      title: `Deleted “${conversationTitle(removed)}”`,
      actionProps: {
        children: "Undo",
        onClick: () => {
          assistant.restore(removed, index)
          toast.close(toastId)
        },
      },
    })
  }

  return (
    <>
      <title>{`Assistant · ${demo.workspace.name}`}</title>
      {messages.length > 0 && (
        <PageActions>
          <PageAction
            id="assistant-panel-toggle"
            variant="outline"
            icon={PanelRight}
            label="Conversation"
            aria-expanded={inspector.open}
            onClick={() =>
              inspector.open
                ? closeInspector()
                : setInspector((state) => ({ ...state, open: true }))
            }
          />
        </PageActions>
      )}
      <div className="assistant-layout">
        <AssistantHistory
          items={assistant.history().map((item) => ({
            id: item.id,
            title: conversationTitle(item),
          }))}
          activeId={conversation.id}
          onSelect={assistant.select}
          onRename={assistant.rename}
          onDelete={remove}
        />
        <AssistantChat
          key={conversation.id}
          intro={script}
          initialDraft={initialDraft}
          messages={messages}
          status={status}
          error={session.error}
          stopped={conversation.stopped}
          posted={conversation.posted}
          onPost={(artifactId, projectId, markdown) => {
            if (demo.postComment(projectId, plainText(markdown)))
              assistant.markPosted(conversation.id, artifactId)
          }}
          versions={
            versions.length > 1 && last
              ? {
                  index: versions.findIndex((reply) => reply.id === last.id),
                  count: versions.length,
                  onSelect: (index) => {
                    keepLatest()
                    setMessages([...messages.slice(0, -1), versions[index]])
                  },
                }
              : undefined
          }
          composer={{
            projects: demo.projects.filter(
              (project) => project.status !== "completed",
            ),
            models,
            model: assistant.model,
            onModelChange: (id) => {
              const next = modelIds.find((model) => model === id)

              if (next) assistant.setModel(next)
            },
            usage: contextUsage(messages, assistant.model),
          }}
          onSend={async (submission) => {
            const options = request()

            void session.sendMessage(
              { parts: await messageParts(submission) },
              options,
            )
          }}
          onStop={() => void session.stop()}
          onRegenerate={() => {
            keepLatest()
            void session.regenerate(request())
          }}
          onRestore={restore}
          onNewChat={assistant.newChat}
          onAnswer={(toolCallId, projectId) =>
            void session.addToolOutput({
              tool: "chooseProject",
              toolCallId,
              output: { projectId },
              options: request(),
            })
          }
          onDecide={(id, approved) =>
            void session.addToolApprovalResponse({
              id,
              approved,
              options: request(),
            })
          }
          renderLink={(props) => <ReplyLink {...props} />}
          onOpenWork={(messageId) =>
            setInspector((state) => ({
              open: true,
              tab: "work",
              focus: { messageId, key: (state.focus?.key ?? 0) + 1 },
            }))
          }
        />
        <AssistantInspector
          open={inspector.open && messages.length > 0}
          messages={messages}
          stopped={conversation.stopped}
          posted={conversation.posted}
          tab={inspector.tab}
          focus={inspector.focus}
          renderLink={(props) => <ReplyLink {...props} />}
          onTabChange={(tab) => setInspector((state) => ({ ...state, tab }))}
          onClose={closeInspector}
        />
      </div>
    </>
  )
}
