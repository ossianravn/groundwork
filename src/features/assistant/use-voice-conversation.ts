import { useCallback, useEffect, useRef, useState } from "react"
import type { ChatStatus } from "ai"
import { usePulseLevel, useStreamLevel } from "@/kit/voice/audio-level"
import { useSpeechOutput } from "@/kit/voice/speech-output"
import {
  join,
  speechRecognitionSupported,
  useSpeechRecognition,
} from "@/kit/voice/speech-recognition"
import type { VoiceState } from "@/kit/voice/voice-state"
import type { AssistantMessage } from "@/demo/assistant/assistant-types"
import { awaitsPerson, messageText, spokenText } from "./assistant-text"

export type VoicePhase =
  | "off"
  /** No microphone or recognition: offer the sample instead. */
  | "offer"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  /** The reply needs an answer or approval in the chat. */
  | "waiting"
  /** The sample has played. */
  | "done"

const states: Record<VoicePhase, VoiceState> = {
  off: "idle",
  offer: "idle",
  connecting: "connecting",
  listening: "listening",
  thinking: "thinking",
  speaking: "speaking",
  waiting: "idle",
  done: "idle",
}

/** What a reply says aloud: its prose, and where to look for the rest. */
function speakable(message: AssistantMessage) {
  const text = message.parts
    .flatMap((part) => (part.type === "text" ? part.text : []))
    .join(" ")

  // An answer without prose leads with its first line, such as its title.
  const lead = spokenText(
    messageText(message)
      .split("\n")
      .find((line) => line.trim()) ?? "",
  )

  const prose = spokenText(text) || (lead && lead.replace(/[^.!?]$/u, "$&."))

  const shown = message.parts.some(
    (part) =>
      part.type === "tool-showAnswer" ||
      part.type === "tool-createTasks" ||
      part.type === "tool-applyPlan" ||
      part.type === "tool-chooseProject",
  )

  if (awaitsPerson(message))
    return join(prose, "It needs your answer in the chat.")

  return shown ? join(prose, "The details are in the chat.") : prose
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * A spoken conversation over the chat: it listens for a question, sends
 * it, speaks the reply and listens again. Messages land in the thread like
 * typed ones. Without a microphone it can play a scripted sample instead.
 */
export function useVoiceConversation({
  status,
  messages,
  send,
  stop,
  sample,
}: {
  status: ChatStatus
  messages: AssistantMessage[]
  send: (text: string) => void
  stop: () => void
  /** Questions the sample conversation asks, in order. */
  sample: string[]
}) {
  const [phase, setPhase] = useState<VoicePhase>("off")
  const [muted, setMuted] = useState(false)
  const [heard, setHeard] = useState("")
  const [startedAt, setStartedAt] = useState(0)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [scripted, setScripted] = useState(false)
  const [turn, setTurn] = useState(0)
  const { speak, cancel, progress, level: speechLevel } = useSpeechOutput()
  const { read: sampleLevel, beat } = usePulseLevel()
  const micLevel = useStreamLevel(stream)
  // How much of which reply has been spoken, and replies to stay quiet for.
  const spoken = useRef({ id: "", length: 0 })
  const session = useRef(0)
  const latest = useRef({ send, stop, phase, muted, sample })

  useEffect(() => {
    latest.current = { send, stop, phase, muted, sample }
  })

  const recognition = useSpeechRecognition({
    onTranscript: ({ final, interim }) => setHeard(join(final, interim)),
    onEnd: (final) => {
      // Muting or ending mid-sentence drops the words rather than sending.
      if (
        !final ||
        latest.current.phase !== "listening" ||
        latest.current.muted
      )
        return

      setHeard(final)
      setPhase("thinking")
      latest.current.send(final)
    },
    onError: (code) => {
      if (
        code === "not-allowed" ||
        code === "service-not-allowed" ||
        code === "audio-capture"
      )
        setPhase("offer")
    },
  })

  const { listening, start: listen, stop: unlisten } = recognition

  // Listening resumes after every pause, unless muted or scripted.
  useEffect(() => {
    if (phase === "listening" && !muted && !scripted && !listening) listen()

    if ((phase !== "listening" || muted) && listening) unlisten()
  }, [phase, muted, scripted, listening, listen, unlisten])

  // The sample asks its question a word at a time, as if heard.
  useEffect(() => {
    if (phase !== "listening" || !scripted) return

    const question = latest.current.sample[turn]
    const id = ++session.current

    if (!question) return

    void (async () => {
      const words = question.split(" ")

      for (let index = 1; index <= words.length; index++) {
        await wait(index === 1 ? 700 : 260)

        if (session.current !== id) return

        beat(0.6)
        setHeard(words.slice(0, index).join(" "))
      }

      await wait(600)

      if (session.current !== id) return

      setPhase("thinking")
      latest.current.send(question)
    })()
  }, [phase, scripted, turn, beat])

  // A finished reply is spoken: only what has not been spoken yet.
  const last = messages.at(-1)

  // A decision made in the chat continues the reply; voice follows it.
  if (phase === "waiting" && (status === "submitted" || status === "streaming"))
    setPhase("thinking")

  useEffect(() => {
    if (
      phase !== "thinking" ||
      status !== "ready" ||
      last?.role !== "assistant"
    )
      return

    const words = speakable(last)
    const said = spoken.current.id === last.id ? spoken.current.length : 0

    if (said >= words.length) return

    spoken.current = { id: last.id, length: words.length }

    const id = session.current

    setPhase("speaking")
    void speak(words.slice(said)).then((finished) => {
      if (!finished || session.current !== id) return

      if (awaitsPerson(last)) return setPhase("waiting")

      setHeard("")
      setTurn((count) => count + 1)
      setPhase(scripted && turn + 1 >= sample.length ? "done" : "listening")
    })
  }, [phase, status, last, speak, scripted, turn, sample.length])

  const release = useCallback(() => {
    setStream((current) => {
      current?.getTracks().forEach((track) => track.stop())

      return null
    })
  }, [])

  const begin = (next: VoicePhase, isScripted: boolean) => {
    session.current++
    spoken.current = {
      id: last?.id ?? "",
      length: last ? speakable(last).length : 0,
    }
    setScripted(isScripted)
    setTurn(0)
    setHeard("")
    setMuted(false)
    setStartedAt(Date.now())
    setPhase(next)
  }

  const start = () => {
    if (!speechRecognitionSupported() || !navigator.mediaDevices)
      return begin("offer", false)

    begin("connecting", false)
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((next) => {
        setStream(next)
        setPhase((current) =>
          current === "connecting" ? "listening" : current,
        )
      })
      .catch(() =>
        setPhase((current) => (current === "connecting" ? "offer" : current)),
      )
  }

  const end = () => {
    session.current++
    cancel()
    unlisten()
    release()
    setPhase("off")
  }

  // Interrupting stops the reply (spoken or still coming) and listens.
  const interrupt = () => {
    if (phase === "thinking") {
      latest.current.stop()
      spoken.current = { id: last?.id ?? "", length: Number.POSITIVE_INFINITY }
    }

    session.current++
    cancel()
    setHeard("")
    setTurn((count) => (phase === "speaking" ? count + 1 : count))
    setPhase("listening")
  }

  useEffect(() => () => release(), [release])

  const level = () =>
    phase === "speaking" ? speechLevel() : scripted ? sampleLevel() : micLevel()

  return {
    phase,
    state: states[phase],
    open: phase !== "off",
    scripted,
    muted,
    setMuted: (next: boolean) => {
      setMuted(next)
      stream?.getAudioTracks().forEach((track) => (track.enabled = !next))
    },
    heard,
    speech: progress,
    startedAt,
    level,
    start,
    playSample: () => begin("listening", true),
    end,
    interrupt,
  }
}
