import * as React from "react"
import type { usePromptAttachments } from "@/kit/ai/use-prompt-attachments"

/** Mirrors the AI SDK's chat status. */
export type PromptStatus = "ready" | "submitted" | "streaming" | "error"

export interface PromptSubmission {
  text: string
  files: File[]
  /** Records attached as context, such as a project. */
  references: { value: string; label: string }[]
}

export const PromptInputContext = React.createContext<{
  value: string
  setValue: (value: string) => void
  busy: boolean
  /** Enter queues the message while the model works. */
  queue?: () => void
  attachments: ReturnType<typeof usePromptAttachments>
  openFilePicker: () => void
  textarea: React.RefObject<HTMLTextAreaElement | null>
} | null>(null)

export function usePromptInput() {
  const context = React.useContext(PromptInputContext)

  if (!context) throw new Error("Prompt input parts need a PromptInput")

  return context
}
