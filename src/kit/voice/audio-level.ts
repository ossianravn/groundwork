"use client"

import * as React from "react"

/** Reads a loudness from 0 to 1; called once per animation frame. */
export type LevelSource = () => number

export const silent: LevelSource = () => 0

/**
 * The loudness of a microphone stream. The level is measured against a
 * noise floor the reader learns as it goes, so a quiet room reads as
 * silence and ordinary speech fills most of the range.
 */
export function useStreamLevel(stream: MediaStream | null): LevelSource {
  const read = React.useRef<LevelSource>(silent)

  React.useEffect(() => {
    if (!stream?.getAudioTracks().length) return

    const context = new AudioContext()
    const analyser = context.createAnalyser()
    const samples = new Float32Array(analyser.fftSize)
    let floor = 0.01
    let level = 0

    analyser.smoothingTimeConstant = 0.6
    context.createMediaStreamSource(stream).connect(analyser)
    read.current = () => {
      analyser.getFloatTimeDomainData(samples)

      let sum = 0

      for (const sample of samples) sum += sample * sample

      const rms = Math.sqrt(sum / samples.length)

      // The floor follows quiet moments down quickly and noise up slowly.
      floor = rms < floor ? rms : floor + (rms - floor) * 0.002

      const target = Math.min(1, Math.max(0, (rms - floor * 1.5) * 12))

      level += (target - level) * (target > level ? 0.5 : 0.12)

      return level
    }

    return () => {
      read.current = silent
      void context.close()
    }
  }, [stream])

  return React.useCallback(() => read.current(), [])
}

/**
 * A level made from beats, for audio the page cannot measure (the browser's
 * own speech output, or a scripted sample): each `beat` lifts the level,
 * which then falls away.
 */
export function usePulseLevel() {
  const state = React.useRef<Pulse>({ level: 0, at: 0 })

  const beat = React.useCallback((strength = 0.7) => {
    state.current = {
      level: Math.max(decayed(state.current), strength),
      at: now(),
    }
  }, [])

  const read = React.useCallback(() => decayed(state.current), [])

  return { read, beat }
}

interface Pulse {
  level: number
  at: number
}

const now = () => performance.now()

const decayed = ({ level, at }: Pulse) => level * Math.exp(-(now() - at) / 220)
