"use client"

import * as React from "react"
import { Mic } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/kit/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/kit/ui/tooltip"
import { usePromptInput } from "@/kit/ai/prompt-input-context"
import { silent, useStreamLevel, type LevelSource } from "./audio-level"
import {
  join,
  speechErrorMessage,
  speechRecognitionSupported,
  useSpeechRecognition,
} from "./speech-recognition"

const subscribeNever = () => () => {}

/**
 * Dictation for the prompt input: the words appear in the message as they
 * are heard, after anything already written, and stay there to edit or
 * send. It works while the model replies, so a follow-up can be spoken and
 * queued. Typing or sending stops it. Hidden where the browser cannot
 * recognise speech.
 */
function PromptInputSpeech({
  lang,
  onError,
  className,
}: {
  lang?: string
  /** Why listening failed, in words to show the person. */
  onError?: (message: string) => void
  className?: string
}) {
  const { value, setValue, textarea } = usePromptInput()

  const supported = React.useSyncExternalStore(
    subscribeNever,
    speechRecognitionSupported,
    () => false,
  )

  const [stream, setStream] = React.useState<MediaStream | null>(null)
  const level = useStreamLevel(stream)
  // The text before listening began, and the text dictation last wrote.
  const base = React.useRef("")
  const written = React.useRef<string | null>(null)

  const { listening, start, stop } = useSpeechRecognition({
    lang,
    continuous: true,
    onTranscript: ({ final, interim }) => {
      if (written.current === null) return

      written.current = join(base.current, join(final, interim))
      setValue(written.current)
    },
    onEnd: () => {
      written.current = null
      setStream((current) => {
        current?.getTracks().forEach((track) => track.stop())

        return null
      })
    },
    onError: (code) => {
      const message = speechErrorMessage(code)

      if (message) onError?.(message)
    },
  })

  // An edit of the person's own (typing, sending, clearing) ends dictation.
  React.useEffect(() => {
    if (written.current !== null && value !== written.current) {
      written.current = null
      stop()
    }
  }, [value, stop])

  if (!supported) return null

  const toggle = () => {
    if (listening) {
      stop()
      textarea.current?.focus()

      return
    }

    base.current = value
    written.current = value
    start()
    // The level meter is a nicety; recognition works without it.
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then((next) =>
        written.current === null
          ? next.getTracks().forEach((track) => track.stop())
          : setStream(next),
      )
      .catch(() => {})
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant={listening ? "secondary" : "ghost"}
            size="icon"
            aria-label="Dictate"
            aria-pressed={listening}
            className={cn("rounded-full", className)}
            onClick={toggle}
          />
        }
      >
        {listening ? (
          <LevelBars level={stream ? level : silent} />
        ) : (
          <Mic aria-hidden="true" />
        )}
      </TooltipTrigger>
      <TooltipContent>
        {listening ? "Stop dictating" : "Dictate"}
      </TooltipContent>
    </Tooltip>
  )
}

/** Four bars that move with the voice, in place of the microphone icon. */
function LevelBars({ level }: { level: LevelSource }) {
  const root = React.useRef<HTMLSpanElement>(null)

  React.useEffect(() => {
    const bars = [...(root.current?.children ?? [])]

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let frame = 0
    const reach = [0.55, 1, 0.8, 0.45]

    const draw = (time: number) => {
      frame = requestAnimationFrame(draw)

      const heard = level()

      bars.forEach((bar, index) => {
        if (!(bar instanceof HTMLElement)) return

        // A gentle idle ripple, lifted by what the microphone hears.
        const ripple = 0.3 + 0.1 * Math.sin(time / 260 + index * 1.4)
        const height = Math.min(1, ripple + heard * (reach[index] ?? 1))

        bar.style.transform = `scaleY(${height.toFixed(3)})`
      })
    }

    frame = requestAnimationFrame(draw)

    return () => cancelAnimationFrame(frame)
  }, [level])

  return (
    <span
      ref={root}
      aria-hidden="true"
      className="flex h-4 items-center gap-0.5 text-brand"
    >
      {[0, 1, 2, 3].map((index) => (
        <span
          key={index}
          className="h-full w-0.5 scale-y-50 rounded-full bg-current"
        />
      ))}
    </span>
  )
}

export { PromptInputSpeech }
