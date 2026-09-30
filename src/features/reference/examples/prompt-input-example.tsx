import { useEffect, useState } from "react"
import { Shimmer } from "@/kit/ui/shimmer"
import { ModelSelector } from "@/kit/ai/model-selector"
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptStatus,
} from "@/kit/ai/prompt-input"
import {
  PromptInputActionMenu,
  PromptInputAddFiles,
  PromptInputAttachments,
} from "@/kit/ai/prompt-input-parts"

const models = [
  { id: "fast", name: "Fast", description: "Quick answers" },
  { id: "balanced", name: "Balanced", description: "Reasons briefly first" },
]

export function PromptInputExample() {
  const [status, setStatus] = useState<PromptStatus>("ready")
  const [model, setModel] = useState("balanced")
  const [sent, setSent] = useState("")

  // Stands in for a model: it "replies" for three seconds unless stopped.
  useEffect(() => {
    if (status !== "streaming") return

    const timer = setTimeout(() => setStatus("ready"), 3000)

    return () => clearTimeout(timer)
  }, [status])

  return (
    <div className="grid max-w-xl gap-3">
      <PromptInput
        status={status}
        onSubmit={({ text, files }) => {
          setSent(
            [text, files.length ? `${files.length} files` : ""]
              .filter(Boolean)
              .join(" + "),
          )
          setStatus("streaming")
        }}
        onStop={() => setStatus("ready")}
      >
        <PromptInputAttachments />
        <PromptInputTextarea
          aria-label="Message"
          placeholder="Ask about your projects"
        />
        <PromptInputFooter>
          <PromptInputActionMenu>
            <PromptInputAddFiles />
          </PromptInputActionMenu>
          <span className="flex-1" />
          <ModelSelector
            models={models}
            value={model}
            onValueChange={setModel}
          />
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
      <p className="min-h-5 text-sm text-muted-foreground" role="status">
        {status === "streaming" ? (
          <Shimmer>Replying to “{sent}”…</Shimmer>
        ) : (
          sent && `Sent “${sent}”.`
        )}
      </p>
    </div>
  )
}
