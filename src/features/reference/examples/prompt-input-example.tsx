import { useEffect, useState } from "react"
import { Shimmer } from "@/kit/ui/shimmer"
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  type PromptStatus,
} from "@/kit/ai/prompt-input"

export function PromptInputExample() {
  const [status, setStatus] = useState<PromptStatus>("ready")
  const [sent, setSent] = useState("")

  // Stands in for a model: it "replies" for three seconds unless stopped.
  useEffect(() => {
    if (status !== "streaming") return

    const timer = setTimeout(() => setStatus("ready"), 3000)

    return () => clearTimeout(timer)
  }, [status])

  return (
    <div className="grid max-w-xl gap-3">
      <p className="min-h-5 text-sm text-muted-foreground" role="status">
        {status === "streaming" ? (
          <Shimmer>Replying to “{sent}”…</Shimmer>
        ) : (
          sent && `Sent “${sent}”.`
        )}
      </p>
      <PromptInput
        status={status}
        onSubmit={({ text, files }) => {
          setSent(text || `${files.length} files`)
          setStatus("streaming")
        }}
        onStop={() => setStatus("ready")}
      >
        <PromptInputTextarea
          aria-label="Message"
          placeholder="Ask about your projects"
        />
        <PromptInputFooter>
          <span className="text-xs font-normal">
            Shift+Enter for a new line
          </span>
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
    </div>
  )
}
