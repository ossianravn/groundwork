import { useState } from "react"
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/kit/ai/prompt-input"
import { PromptInputSpeech } from "@/kit/voice/prompt-input-speech"

export function SpeechInputExample() {
  const [error, setError] = useState("")
  const [sent, setSent] = useState("")

  return (
    <div className="grid w-full max-w-xl gap-(--gap-control)">
      <PromptInput
        status="ready"
        onSubmit={({ text }) => setSent(text)}
        onStop={() => {}}
      >
        <PromptInputTextarea
          aria-label="Message"
          placeholder="Press the microphone and speak"
        />
        <PromptInputFooter>
          <span className="flex-1" />
          <PromptInputSpeech onError={setError} />
          <PromptInputSubmit />
        </PromptInputFooter>
      </PromptInput>
      <p role="status" className="text-sm text-muted-foreground">
        {error || (sent && `Sent: ${sent}`)}
      </p>
    </div>
  )
}
