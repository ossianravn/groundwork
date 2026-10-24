"use client"

import * as React from "react"
import { Mic, MicOff, PhoneOff } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/kit/ui/button"
import { Kbd } from "@/kit/ui/kbd"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/kit/ui/tooltip"
import type { LevelSource } from "./audio-level"
import { Transcription } from "./transcription"
import { VoiceAura } from "./voice-aura"
import type { VoiceState } from "./voice-state"

export type VoiceLayout = "full" | "bar"

const typing = (target: EventTarget) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    /^(INPUT|TEXTAREA|SELECT)$/u.test(target.tagName))

/**
 * A spoken conversation. Full fills its container with a large aura over
 * captions and controls; bar is a compact strip that takes a composer's
 * place, so the thread stays in view. Inside it, M mutes, Escape ends and
 * Space interrupts a reply.
 */
function VoiceSession({
  layout = "full",
  onMuteToggle,
  onEnd,
  onInterrupt,
  className,
  onKeyDown,
  ...props
}: React.ComponentProps<"section"> & {
  layout?: VoiceLayout
  onMuteToggle?: () => void
  onEnd?: () => void
  onInterrupt?: () => void
}) {
  return (
    <section
      data-slot="voice-session"
      data-layout={layout}
      aria-label="Voice conversation"
      className={cn(
        "group/voice relative",
        layout === "full"
          ? "flex h-full flex-col items-center justify-center gap-(--gap-zone) bg-background px-(--inset-page) py-(--gap-zone)"
          : "flex min-h-14 items-center gap-(--gap-control) rounded-full border border-border bg-card py-2 ps-2 pe-2.5 text-card-foreground shadow-sm",
        className,
      )}
      onKeyDown={(event) => {
        onKeyDown?.(event)

        if (
          event.defaultPrevented ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          typing(event.target)
        )
          return

        if (event.key === "Escape" && onEnd) onEnd()
        else if (event.key.toLowerCase() === "m" && onMuteToggle) onMuteToggle()
        else if (
          event.key === " " &&
          onInterrupt &&
          !(event.target instanceof HTMLButtonElement)
        )
          onInterrupt()
        else return

        event.preventDefault()
      }}
      {...props}
    />
  )
}

/** The aura; while a reply is under way, pressing it interrupts. */
function VoiceSessionVisual({
  state,
  level,
  onInterrupt,
  className,
  style,
}: {
  state: VoiceState
  level?: LevelSource
  onInterrupt?: () => void
  className?: string
  style?: React.CSSProperties
}) {
  const aura = <VoiceAura state={state} level={level} />

  const interruptible =
    onInterrupt && (state === "speaking" || state === "thinking")

  const classes = cn(
    "grid place-items-center rounded-full outline-none group-data-[layout=bar]/voice:[--voice-aura-size:2.5rem] focus-visible:ring-3 focus-visible:ring-ring/50",
    className,
  )

  return interruptible ? (
    <button
      type="button"
      data-slot="voice-session-visual"
      aria-label="Interrupt"
      aria-keyshortcuts="Space"
      className={cn(classes, "cursor-pointer")}
      style={style}
      onClick={onInterrupt}
    >
      {aura}
    </button>
  ) : (
    <div data-slot="voice-session-visual" className={classes} style={style}>
      {aura}
    </div>
  )
}

/**
 * What is being said: the person's words as they are heard, or the reply
 * lighting up as it is spoken. Full keeps room for three lines so the
 * layout holds still between turns.
 */
function VoiceSessionCaption({
  speaker,
  text,
  position,
  className,
}: {
  speaker: "person" | "assistant"
  text: string
  position?: number
  className?: string
}) {
  return (
    <div
      data-slot="voice-session-caption"
      data-speaker={speaker}
      className={cn(
        "min-w-0 group-data-[layout=full]/voice:min-h-[calc(3lh)] group-data-[layout=full]/voice:w-full group-data-[layout=full]/voice:max-w-[36rem] group-data-[layout=full]/voice:text-center group-data-[layout=full]/voice:text-(length:--text-section) group-data-[layout=bar]/voice:truncate group-data-[layout=bar]/voice:text-(length:--text-body) group-data-[layout=bar]/voice:[&>p]:truncate",
        speaker === "person" && "text-muted-foreground",
        className,
      )}
    >
      {speaker === "assistant" ? (
        <Transcription text={text} position={position} />
      ) : (
        <p>{text}</p>
      )}
    </div>
  )
}

/** A polite live region: Listening, Thinking, Speaking and so on. */
function VoiceSessionStatus({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="voice-session-status"
      role="status"
      className={cn(
        "text-(length:--text-meta) font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

function VoiceSessionControls({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="voice-session-controls"
      className={cn("flex items-center gap-(--gap-control)", className)}
      {...props}
    />
  )
}

function VoiceMuteButton({
  muted,
  onMutedChange,
  className,
}: {
  muted: boolean
  onMutedChange: (muted: boolean) => void
  className?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant={muted ? "secondary" : "ghost"}
            size="icon"
            aria-label="Mute microphone"
            aria-pressed={muted}
            aria-keyshortcuts="M"
            className={cn("rounded-full", className)}
            onClick={() => onMutedChange(!muted)}
          />
        }
      >
        {muted ? <MicOff aria-hidden="true" /> : <Mic aria-hidden="true" />}
      </TooltipTrigger>
      <TooltipContent>
        {muted ? "Unmute" : "Mute"} <Kbd>M</Kbd>
      </TooltipContent>
    </Tooltip>
  )
}

function VoiceEndButton({
  onEnd,
  className,
}: {
  onEnd: () => void
  className?: string
}) {
  return (
    <Button
      variant="destructive"
      aria-keyshortcuts="Escape"
      className={cn("rounded-full", className)}
      onClick={onEnd}
    >
      <PhoneOff aria-hidden="true" />
      End
    </Button>
  )
}

/** Minutes and seconds since the session started. */
function VoiceTimer({
  since,
  className,
}: {
  since: number
  className?: string
}) {
  const [now, setNow] = React.useState(since)

  React.useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)

    return () => clearInterval(id)
  }, [])

  const seconds = Math.max(0, Math.floor((now - since) / 1000))

  return (
    <time
      data-slot="voice-timer"
      dateTime={`PT${seconds}S`}
      className={cn(
        "text-(length:--text-meta) text-muted-foreground tabular-nums",
        className,
      )}
    >
      {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
    </time>
  )
}

export {
  VoiceSession,
  VoiceSessionVisual,
  VoiceSessionCaption,
  VoiceSessionStatus,
  VoiceSessionControls,
  VoiceMuteButton,
  VoiceEndButton,
  VoiceTimer,
}
