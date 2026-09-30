import { useEffect, useState, type ComponentProps } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useChat } from "@ai-sdk/react"
import type { PromptSubmission } from "@/kit/ai/prompt-input"
import { readAsDataUrl } from "@/kit/ai/use-prompt-attachments"
import {
  conversationCost,
  modelOf,
  models,
} from "@/demo/assistant/assistant-model"
import type {
  AssistantMessage,
  AssistantRequest,
  ModelId,
} from "@/demo/assistant/assistant-types"
import { createAssistantChat } from "@/demo/assistant/create-assistant-chat"
import { AssistantChat } from "@/features/assistant/assistant-chat"
import script from "@/demo/data/assistant.json"
import { useDemoState } from "./demo-state"
import { useRouteFocus } from "./use-route-focus"

/**
 * Links in replies: workspace paths use the router, others open normally.
 * A project opened from a reply offers Back to assistant.
 */
function ReplyLink({ href: path, onClick, ...props }: ComponentProps<"a">) {
  const navigate = useNavigate()

  const href = path?.startsWith("/app/demo/projects/")
    ? `${path}?returnTo=${encodeURIComponent("/app/demo/assistant")}`
    : path

  return (
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event)

        if (
          event.defaultPrevented ||
          !href?.startsWith("/") ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return

        event.preventDefault()
        void navigate({ href })
      }}
      {...props}
    />
  )
}

const modelIds: ModelId[] = ["fast", "balanced", "thorough"]

/** The message parts for a submission: files, attached projects, then text. */
async function messageParts({ text, files, references }: PromptSubmission) {
  const fileParts = await Promise.all(
    files.map(async (file) => ({
      type: "file" as const,
      mediaType: file.type,
      filename: file.name,
      url: await readAsDataUrl(file),
    })),
  )

  const parts: AssistantMessage["parts"] = [
    ...fileParts,
    ...references.map(({ value, label }) => ({
      type: "data-project" as const,
      data: { id: value, name: label },
    })),
  ]

  return text ? [...parts, { type: "text" as const, text }] : parts
}

/** The latest reply's reported usage against the chosen model's window. */
function contextUsage(messages: AssistantMessage[], model: ModelId) {
  const meta = [...messages]
    .reverse()
    .find((message) => message.metadata)?.metadata

  if (!meta) return undefined

  return {
    used: meta.usage.input + meta.usage.output,
    max: modelOf(model).contextWindow,
    input: meta.usage.input,
    output: meta.usage.output,
    cost: conversationCost(messages),
  }
}

export function AssistantRoute() {
  const { demo, assistant } = useDemoState()
  const { scenario } = useSearch({ from: "/app/demo/assistant" })

  const { generation, adopt, markStopped } = assistant

  // The demo state keeps the conversation; this page creates it, so the AI
  // SDK loads with the page. A new generation (New chat, Reset) starts over.
  const [session, setSession] = useState(() => ({
    generation,
    chat: assistant.chat ?? createAssistantChat(markStopped),
  }))

  if (session.generation !== generation)
    setSession({
      generation,
      chat: assistant.chat ?? createAssistantChat(markStopped),
    })

  useEffect(() => adopt(session.chat), [adopt, session.chat])

  const {
    messages,
    status,
    error,
    sendMessage,
    stop,
    regenerate,
    addToolOutput,
    addToolApprovalResponse,
  } = useChat({ chat: session.chat, throttle: 40 })

  useRouteFocus()

  // Read when a request is made, so replies reflect the records at that
  // time. createTasks is the tool implementation an approval runs.
  const request = () => ({
    body: {
      scenario,
      model: assistant.model,
      context: {
        projects: demo.projects,
        activity: demo.activity,
        people: demo.workspace.people,
        referenceDate: demo.workspace.referenceDate,
      },
      actions: {
        createTasks: ({ projectId, tasks }) =>
          demo.addTasks(
            projectId,
            tasks.map(({ title, assigneeId }) => ({ title, assigneeId })),
          ),
      },
    } satisfies AssistantRequest,
  })

  return (
    <>
      <title>{`Assistant · ${demo.workspace.name}`}</title>
      <AssistantChat
        intro={script}
        messages={messages}
        status={status}
        error={error}
        stopped={assistant.stopped}
        onSend={async (submission) => {
          const options = request()

          void sendMessage({ parts: await messageParts(submission) }, options)
        }}
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
        onStop={() => void stop()}
        onRegenerate={() => void regenerate(request())}
        onNewChat={assistant.newChat}
        onAnswer={(toolCallId, projectId) =>
          void addToolOutput({
            tool: "chooseProject",
            toolCallId,
            output: { projectId },
            options: request(),
          })
        }
        onDecide={(id, approved) =>
          void addToolApprovalResponse({ id, approved, options: request() })
        }
        renderLink={(props) => <ReplyLink {...props} />}
      />
    </>
  )
}
