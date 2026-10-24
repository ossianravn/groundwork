import { useEffect, useRef, useState, type ReactNode } from "react"
import { flushSync } from "react-dom"
import { Maximize2, MessageSquareText, Play } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/kit/ui/tooltip"
import { sentenceAt } from "@/kit/voice/speech-text"
import {
  VoiceEndButton,
  VoiceMuteButton,
  VoiceSession,
  VoiceSessionCaption,
  VoiceSessionControls,
  VoiceSessionStatus,
  VoiceSessionVisual,
  VoiceTimer,
  type VoiceLayout,
} from "@/kit/voice/voice-session"
import { voiceStatusLabel } from "@/kit/voice/voice-state"
import type { useVoiceConversation } from "./use-voice-conversation"

type Voice = ReturnType<typeof useVoiceConversation>

// The aura keeps its identity between the two layouts, so it shrinks into
// the bar and grows back out of it.
const aura = { viewTransitionName: "assistant-voice-aura" }

function changeLayout(apply: () => void) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches

  if (!document.startViewTransition || reduce) return apply()

  document.startViewTransition(() => flushSync(apply))
}

function statusText(voice: Voice) {
  if (voice.phase === "waiting") return "Waiting for you in the chat"

  if (voice.phase === "done") return "That was the sample"

  return voiceStatusLabel(voice.state, voice.muted)
}

/** What is being said now: the reply as it is spoken, or what was heard. */
function caption(voice: Voice) {
  if (voice.speech) {
    const { text, position } = sentenceAt(
      voice.speech.text,
      voice.speech.position,
    )

    return (
      <VoiceSessionCaption
        speaker="assistant"
        text={text}
        position={position}
      />
    )
  }

  return <VoiceSessionCaption speaker="person" text={voice.heard} />
}

/**
 * The composer, or the voice session in its place. Full covers the chat
 * with a large aura and captions; the bar keeps the thread in view, for
 * answers to read or act on. A reply that needs a decision moves the
 * session to the bar by itself.
 */
export function AssistantVoice({
  voice,
  composer,
}: {
  voice: Voice
  composer: ReactNode
}) {
  const [layout, setLayout] = useState<VoiceLayout>("full")
  const [phase, setPhase] = useState(voice.phase)
  const session = useRef<HTMLElement>(null)

  if (phase !== voice.phase) {
    setPhase(voice.phase)

    if (phase === "off") setLayout("full")

    if (voice.phase === "waiting") setLayout("bar")
  }

  // Focus follows the session: into it as it opens or changes layout, and
  // back to the composer's voice button when it ends.
  useEffect(() => {
    if (voice.open) session.current?.focus()
    else document.getElementById("assistant-voice-start")?.focus()
  }, [voice.open, layout])

  if (!voice.open) return composer

  const interrupt =
    voice.phase === "speaking" || voice.phase === "thinking"
      ? voice.interrupt
      : undefined

  const handlers = {
    ref: session,
    tabIndex: -1,
    onEnd: voice.end,
    onInterrupt: interrupt,
    onMuteToggle: voice.scripted
      ? undefined
      : () => voice.setMuted(!voice.muted),
  }

  const controls =
    voice.phase === "offer" ? (
      <>
        <Button className="rounded-full" onClick={voice.playSample}>
          <Play aria-hidden="true" />
          Play a sample
        </Button>
        <Button variant="ghost" className="rounded-full" onClick={voice.end}>
          Not now
        </Button>
      </>
    ) : (
      <>
        {!voice.scripted && (
          <VoiceMuteButton muted={voice.muted} onMutedChange={voice.setMuted} />
        )}
        <VoiceEndButton onEnd={voice.end} />
      </>
    )

  if (layout === "bar")
    return (
      <VoiceSession
        layout="bar"
        className="assistant-composer assistant-voice-bar"
        {...handlers}
      >
        <VoiceSessionVisual
          state={voice.state}
          level={voice.level}
          onInterrupt={interrupt}
          style={aura}
        />
        <div className="assistant-voice-bar-text">
          <VoiceSessionStatus>{statusText(voice)}</VoiceSessionStatus>
          {caption(voice)}
        </div>
        <VoiceTimer since={voice.startedAt} />
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                aria-label="Full screen"
                className="rounded-full"
                onClick={() => changeLayout(() => setLayout("full"))}
              />
            }
          >
            <Maximize2 aria-hidden="true" />
          </TooltipTrigger>
          <TooltipContent>Full screen</TooltipContent>
        </Tooltip>
        {controls}
      </VoiceSession>
    )

  return (
    <>
      <VoiceSession layout="full" className="assistant-voice" {...handlers}>
        {voice.phase !== "offer" && (
          <Button
            variant="ghost"
            className="assistant-voice-show-chat"
            onClick={() => changeLayout(() => setLayout("bar"))}
          >
            <MessageSquareText aria-hidden="true" />
            Show chat
          </Button>
        )}
        <VoiceSessionVisual
          state={voice.state}
          level={voice.level}
          onInterrupt={interrupt}
          style={aura}
        />
        {voice.phase === "offer" ? (
          <div className="assistant-voice-offer">
            <h2>Voice needs a microphone</h2>
            <p>
              This browser can't hear you here. Play a sample to hear a question
              answered aloud.
            </p>
          </div>
        ) : (
          <>
            <VoiceSessionStatus>{statusText(voice)}</VoiceSessionStatus>
            {caption(voice)}
          </>
        )}
        <VoiceSessionControls>{controls}</VoiceSessionControls>
      </VoiceSession>
      {composer}
    </>
  )
}
