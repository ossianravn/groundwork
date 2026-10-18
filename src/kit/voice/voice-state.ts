/** Where a spoken conversation is: it drives the aura and the status. */
export type VoiceState =
  "idle" | "connecting" | "listening" | "thinking" | "speaking" | "error"

/** The status line's words for a state. */
export function voiceStatusLabel(state: VoiceState, muted = false) {
  if (muted && state === "listening") return "Muted"

  return {
    idle: "Ready",
    connecting: "Connecting…",
    listening: "Listening",
    thinking: "Thinking…",
    speaking: "Speaking",
    error: "Voice stopped",
  }[state]
}
