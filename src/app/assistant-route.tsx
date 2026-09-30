import { useToast } from "@/kit/ui/use-toast"
import { models } from "@/demo/assistant/assistant-model"
import { conversationTitle } from "@/demo/assistant/use-assistant"
import script from "@/demo/data/assistant.json"
import { AssistantChat } from "@/features/assistant/assistant-chat"
import { AssistantHistory } from "@/features/assistant/assistant-history"
import { contextUsage, messageParts, modelIds } from "./assistant-parts"
import { ReplyLink } from "./assistant-reply-link"
import { useDemoState } from "./demo-state"
import { useAssistantSession } from "./use-assistant-session"
import { useRouteFocus } from "./use-route-focus"

export function AssistantRoute() {
  const { demo, assistant } = useDemoState()
  const toast = useToast()
  const session = useAssistantSession()
  const { messages, setMessages, status, request, conversation } = session

  useRouteFocus()

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
          messages={messages}
          status={status}
          error={session.error}
          stopped={conversation.stopped}
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
        />
      </div>
    </>
  )
}
