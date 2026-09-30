import type { ChatStatus } from "ai"
import {
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/kit/ui/dropdown-menu"
import { Context } from "@/kit/ai/context"
import { ModelSelector, type ModelOption } from "@/kit/ai/model-selector"
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptSubmission,
} from "@/kit/ai/prompt-input"
import {
  PromptInputActionMenu,
  PromptInputAddFiles,
  PromptInputAddReference,
  PromptInputAttachments,
} from "@/kit/ai/prompt-input-parts"
import { ProjectMark } from "@/components/project-identity"
import { formatDate, type Project } from "@/demo/model"

export interface ContextUsage {
  used: number
  max: number
  input: number
  output: number
  /** Dollars, for the whole conversation. */
  cost: number
}

const dollars = (amount: number) =>
  `$${amount.toLocaleString("en-GB", { maximumSignificantDigits: 2 })}`

export function AssistantComposer({
  status,
  waiting,
  draft,
  onDraftChange,
  onSubmit,
  onQueue,
  onStop,
  projects,
  models,
  model,
  onModelChange,
  usage,
}: {
  status: ChatStatus
  /** The latest reply waits for an answer or approval. */
  waiting: boolean
  draft: string
  onDraftChange: (value: string) => void
  onSubmit: (submission: PromptSubmission) => void
  onQueue: (text: string) => void
  onStop: () => void
  /** Projects that can be attached as context. */
  projects: Project[]
  models: ModelOption[]
  model: string
  onModelChange: (id: string) => void
  usage?: ContextUsage
}) {
  const busy = status === "submitted" || status === "streaming"
  const color = (id: string) => projects.find((item) => item.id === id)?.color

  return (
    <PromptInput
      className="assistant-composer"
      status={status}
      value={draft}
      onValueChange={onDraftChange}
      onSubmit={onSubmit}
      onQueue={onQueue}
      onStop={onStop}
    >
      <PromptInputAttachments
        referenceDetail="Project"
        referenceIcon={(id) => {
          const hue = color(id)

          return hue ? <ProjectMark color={hue} /> : null
        }}
      />
      <PromptInputTextarea
        id="assistant-prompt"
        aria-label="Message the assistant"
        placeholder={
          busy || waiting
            ? "Write your next question…"
            : "Ask about projects, tasks or activity"
        }
      />
      <PromptInputFooter>
        <PromptInputActionMenu>
          <PromptInputAddFiles />
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Add a project as context</DropdownMenuLabel>
            {projects.map((project) => (
              <PromptInputAddReference
                key={project.id}
                value={project.id}
                label={project.name}
                icon={<ProjectMark color={project.color} />}
                description={`due ${formatDate(project.dueDate)}`}
              />
            ))}
          </DropdownMenuGroup>
        </PromptInputActionMenu>
        <span className="flex-1" />
        {usage && (
          <Context
            used={usage.used}
            max={usage.max}
            breakdown={[
              { label: "Last input", tokens: usage.input },
              { label: "Last output", tokens: usage.output },
            ]}
            cost={dollars(usage.cost)}
          />
        )}
        <ModelSelector
          models={models}
          value={model}
          onValueChange={onModelChange}
        />
        <PromptInputSubmit />
      </PromptInputFooter>
    </PromptInput>
  )
}
