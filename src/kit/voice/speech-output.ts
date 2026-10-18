"use client"

import * as React from "react"
import { usePulseLevel } from "./audio-level"
import { sentences } from "./speech-text"

export interface SpeechProgress {
  text: string
  /** Characters of `text` reached so far: the current word has begun. */
  position: number
}

// About 170 words a minute, the pace of an unhurried speaker.
const charsPerSecond = 15

function pickVoice(lang: string) {
  const voices = speechSynthesis.getVoices()
  const [base = lang] = lang.split("-")
  const matching = voices.filter((voice) => voice.lang.startsWith(base))
  const exact = matching.filter((voice) => voice.lang === lang)

  // Natural voices sound best and report each word; local voices report too.
  return [...exact, ...matching].find(
    (voice) => /natural/iu.test(voice.name) || voice.localService,
  )
}

/**
 * Speaks text with the browser's voices, sentence by sentence (long
 * utterances stall in some browsers), and reports how far it has got so
 * captions can follow. Where the voice reports no words, or `audible` is
 * false, progress follows a steady speaking pace instead.
 */
export function useSpeechOutput({
  audible = true,
  lang,
}: { audible?: boolean; lang?: string } = {}) {
  const [progress, setProgress] = React.useState<SpeechProgress | null>(null)
  const { read, beat } = usePulseLevel()
  const cancelled = React.useRef<() => void>(() => {})

  const cancel = React.useCallback(() => {
    cancelled.current()
    setProgress(null)
  }, [])

  const speak = React.useCallback(
    async (text: string) => {
      cancelled.current()

      let stopped = false

      const timers = new Set<number>()

      cancelled.current = () => {
        stopped = true
        timers.forEach(clearTimeout)

        if (audible && "speechSynthesis" in window) speechSynthesis.cancel()
      }

      const wait = (ms: number) =>
        new Promise<void>((resolve) => {
          const id = window.setTimeout(() => {
            timers.delete(id)
            resolve()
          }, ms)

          timers.add(id)
        })

      // Paced progress: one word at a time at a speaking pace.
      const paceThrough = async (
        sentence: string,
        offset: number,
        over = () => false,
      ) => {
        for (const word of sentence.matchAll(/\S+/gu)) {
          if (stopped || over()) return

          setProgress({ text, position: offset + word.index + 1 })
          beat(0.5 + Math.min(0.4, word[0].length / 20))
          await wait(((word[0].length + 1) / charsPerSecond) * 1000)
        }
      }

      const voiced = (sentence: string, offset: number) =>
        new Promise<void>((resolve) => {
          const utterance = new SpeechSynthesisUtterance(sentence)
          let words = false
          let ended = false
          let pacing: Promise<void> | undefined

          utterance.lang = lang || document.documentElement.lang || "en"
          utterance.voice = pickVoice(utterance.lang) ?? null
          utterance.addEventListener("boundary", (event) => {
            if (event.name !== "word") return

            words = true
            setProgress({ text, position: offset + event.charIndex + 1 })
            beat(0.5 + Math.min(0.4, (event.charLength || 4) / 20))
          })
          utterance.addEventListener("start", () => {
            // Wait a moment for word reports; pace the captions without them.
            void wait(400).then(() => {
              if (!words && !stopped && !ended)
                pacing = paceThrough(sentence, offset, () => ended)
            })
          })
          utterance.addEventListener("end", () => {
            ended = true
            resolve()
          })
          utterance.addEventListener(
            "error",
            () =>
              // A voice that cannot start still shows its words.
              void (pacing ?? paceThrough(sentence, offset)).then(resolve),
          )
          speechSynthesis.speak(utterance)

          // No start at all (no voices installed): show the words anyway.
          void wait(1500).then(() => {
            if (!speechSynthesis.speaking && !words && !pacing && !stopped) {
              speechSynthesis.cancel()
              void paceThrough(sentence, offset).then(resolve)
            }
          })
        })

      const voice = audible && "speechSynthesis" in window

      for (const { text: sentence, start } of sentences(text)) {
        if (stopped) break

        await (voice ? voiced(sentence, start) : paceThrough(sentence, start))
      }

      if (!stopped) setProgress(null)

      return !stopped
    },
    [audible, lang, beat],
  )

  React.useEffect(() => () => cancelled.current(), [])

  return { speak, cancel, progress, level: read }
}
