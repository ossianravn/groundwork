"use client"

import * as React from "react"

/** The parts of the Web Speech API's recognizer the kit uses. */
interface Recognizer extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
}

type RecognizerConstructor = new () => Recognizer

// lib.dom types the recognizer's events but not the recognizer itself;
// Chrome and Safari still expose it under its webkit name.
declare global {
  interface Window {
    SpeechRecognition?: RecognizerConstructor
    webkitSpeechRecognition?: RecognizerConstructor
  }
}

function recognizerConstructor() {
  return (
    globalThis.window?.SpeechRecognition ??
    globalThis.window?.webkitSpeechRecognition
  )
}

// Chrome names the event classes webkitSpeechRecognition…Event, so events
// are recognised by their fields rather than their class.
const isResult = (event: Event): event is SpeechRecognitionEvent =>
  "results" in event && "resultIndex" in event

const isError = (event: Event): event is SpeechRecognitionErrorEvent =>
  "error" in event

/** Whether this browser can turn speech into text (Chrome, Edge, Safari). */
export function speechRecognitionSupported() {
  return !!recognizerConstructor()
}

export type SpeechErrorCode = SpeechRecognitionErrorCode | "unsupported"

/** What to tell the person when listening fails, or "" when nothing is. */
export function speechErrorMessage(code: SpeechErrorCode) {
  switch (code) {
    case "not-allowed":
    case "service-not-allowed":
      return "Allow the microphone for this site to talk instead of typing."
    case "audio-capture":
      return "No microphone was found."
    case "network":
      return "Speech recognition needs a connection. Try again when online."
    case "language-not-supported":
      return "Speech recognition doesn't support this language."
    case "unsupported":
      return "This browser can't turn speech into text."
    default:
      return ""
  }
}

export interface SpeechRecognitionOptions {
  /** A BCP 47 tag; the page's language by default. */
  lang?: string
  /** Keep listening through pauses until stopped (dictation). */
  continuous?: boolean
  /** Everything heard since listening started: settled words, then guesses. */
  onTranscript?: (transcript: { final: string; interim: string }) => void
  /** Listening stopped; `final` is everything that settled. */
  onEnd?: (final: string) => void
  onError?: (code: SpeechErrorCode) => void
}

/**
 * Speech to text with the browser's recognizer. `start` must run from a
 * gesture the first time, so the browser can ask for the microphone. In
 * Chrome and Edge the audio is recognised by the browser vendor's service.
 */
export function useSpeechRecognition({
  lang,
  continuous = false,
  ...handlers
}: SpeechRecognitionOptions = {}) {
  const [listening, setListening] = React.useState(false)
  const recognizer = React.useRef<Recognizer | null>(null)
  const latest = React.useRef(handlers)

  React.useEffect(() => {
    latest.current = handlers
  })

  const stop = React.useCallback(() => recognizer.current?.stop(), [])

  const start = React.useCallback(() => {
    const Constructor = recognizerConstructor()

    if (!Constructor) return latest.current.onError?.("unsupported")

    if (recognizer.current) return

    const next = new Constructor()
    let final = ""

    next.continuous = continuous
    next.interimResults = true
    next.lang = lang || document.documentElement.lang || navigator.language
    next.addEventListener("result", (event) => {
      if (!isResult(event)) return

      let interim = ""

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index++
      ) {
        const result = event.results[index]

        if (!result) continue

        const words = result[0]?.transcript ?? ""

        if (result.isFinal) final = join(final, words)
        else interim = join(interim, words)
      }

      latest.current.onTranscript?.({ final, interim })
    })
    next.addEventListener("error", (event) => {
      if (isError(event)) latest.current.onError?.(event.error)
    })
    next.addEventListener("end", () => {
      recognizer.current = null
      setListening(false)
      latest.current.onEnd?.(final)
    })
    recognizer.current = next
    setListening(true)
    next.start()
  }, [continuous, lang])

  React.useEffect(() => () => recognizer.current?.abort(), [])

  return { listening, start, stop }
}

/** Joins recognised phrases with one space. */
export function join(text: string, words: string) {
  const next = words.trim()

  return text && next ? `${text} ${next}` : text || next
}
