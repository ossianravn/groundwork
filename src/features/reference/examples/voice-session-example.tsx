import { useEffect, useState } from "react"
import { ToggleGroup, ToggleGroupItem } from "@/kit/ui/toggle-group"
import { usePulseLevel } from "@/kit/voice/audio-level"
import { useSpeechOutput } from "@/kit/voice/speech-output"
import { voiceStatusLabel, type VoiceState } from "@/kit/voice/voice-state"
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

const reply =
  "Two projects need attention this week. Mobile app is the closer one."

const states: VoiceState[] = ["listening", "thinking", "speaking", "idle"]

export function VoiceSessionExample() {
  const [layout, setLayout] = useState<VoiceLayout>("full")
  const [state, setState] = useState<VoiceState>("listening")
  const [muted, setMuted] = useState(false)
  const [since] = useState(() => Date.now())
  const { read: heard, beat } = usePulseLevel()
  const { speak, cancel, progress, level } = useSpeechOutput({ audible: false })

  // Stand-ins for a microphone and a reply: beats while listening, a
  // silently paced line while speaking.
  useEffect(() => {
    if (state === "speaking") {
      void speak(reply)

      return cancel
    }

    if (state !== "listening" || muted) return

    const id = setInterval(() => beat(0.3 + Math.random() * 0.5), 180)

    return () => clearInterval(id)
  }, [state, muted, speak, cancel, beat])

  const session = (
    <VoiceSession layout={layout} onEnd={() => setState("idle")}>
      <VoiceSessionVisual
        state={state}
        level={state === "speaking" ? level : heard}
      />
      <div className={layout === "bar" ? "grid min-w-0 flex-1" : "contents"}>
        <VoiceSessionStatus>
          {voiceStatusLabel(state, muted)}
        </VoiceSessionStatus>
        {state === "speaking" && progress ? (
          <VoiceSessionCaption
            speaker="assistant"
            text={progress.text}
            position={progress.position}
          />
        ) : (
          <VoiceSessionCaption
            speaker="person"
            text={state === "listening" ? "Which projects are at risk?" : ""}
          />
        )}
      </div>
      {layout === "bar" && <VoiceTimer since={since} />}
      <VoiceSessionControls>
        <VoiceMuteButton muted={muted} onMutedChange={setMuted} />
        <VoiceEndButton onEnd={() => setState("idle")} />
      </VoiceSessionControls>
    </VoiceSession>
  )

  return (
    <div className="grid w-full gap-(--gap-group)">
      <div className="flex flex-wrap gap-(--gap-control)">
        <ToggleGroup
          variant="outline"
          spacing={0}
          value={[state]}
          aria-label="State"
          onValueChange={([next]) => {
            const match = states.find((item) => item === next)

            if (match) setState(match)
          }}
        >
          {states.map((item) => (
            <ToggleGroupItem key={item} value={item}>
              {voiceStatusLabel(item).replace("…", "")}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <ToggleGroup
          variant="outline"
          spacing={0}
          value={[layout]}
          aria-label="Layout"
          onValueChange={([next]) => {
            if (next === "full" || next === "bar") setLayout(next)
          }}
        >
          <ToggleGroupItem value="full">Full screen</ToggleGroupItem>
          <ToggleGroupItem value="bar">In chat</ToggleGroupItem>
        </ToggleGroup>
      </div>
      {layout === "full" ? (
        <div className="h-[28rem] overflow-hidden rounded-xl border">
          {session}
        </div>
      ) : (
        <div className="w-full max-w-xl">{session}</div>
      )}
    </div>
  )
}
