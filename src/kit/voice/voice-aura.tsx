"use client"

import * as React from "react"
import { cn } from "cn"
import { silent, type LevelSource } from "./audio-level"
import type { VoiceState } from "./voice-state"

// How fast the light drifts, and how much of it there is, in each state.
const motion: Record<VoiceState, { speed: number; energy: number }> = {
  idle: { speed: 0.25, energy: 0.25 },
  connecting: { speed: 0.9, energy: 0.35 },
  listening: { speed: 0.45, energy: 0.5 },
  thinking: { speed: 1.5, energy: 0.6 },
  speaking: { speed: 0.7, energy: 0.6 },
  error: { speed: 0.12, energy: 0.15 },
}

const blobs = [0, 1, 2]

/**
 * A soft orb of coloured light that drifts with the conversation's state
 * and swells with the sound: the person's voice while listening, the reply
 * while speaking. Motion runs on transforms alone and pauses off screen;
 * with reduced motion the orb holds still and only its brightness changes.
 * Colours come from --voice-aura-1 to -3.
 */
function VoiceAura({
  state,
  level = silent,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  state: VoiceState
  /** Read once a frame; 0 is silence and 1 is loud. */
  level?: LevelSource
}) {
  const root = React.useRef<HTMLDivElement>(null)
  const current = React.useRef(state)
  const read = React.useRef(level)

  React.useEffect(() => {
    current.current = state
    read.current = level
  })

  React.useEffect(() => {
    const element = root.current
    const reduce = matchMedia("(prefers-reduced-motion: reduce)")

    if (!element || reduce.matches) return

    const parts = [...element.querySelectorAll<HTMLElement>("[data-blob]")]
    let visible = true
    let frame = 0
    let last = performance.now()
    let phase = Math.random() * 10
    let speed = motion[current.current].speed
    let energy = motion[current.current].energy
    let sound = 0

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true
    })

    observer.observe(element)

    const draw = (time: number) => {
      frame = requestAnimationFrame(draw)

      const elapsed = Math.min(0.05, (time - last) / 1000)

      last = time

      if (!visible) return

      const target = motion[current.current]

      const heard =
        current.current === "listening" || current.current === "speaking"
          ? read.current()
          : 0

      // Ease toward the state's motion so a change never jumps.
      speed += (target.speed - speed) * elapsed * 3
      energy += (target.energy - energy) * elapsed * 3
      sound += (heard - sound) * Math.min(1, elapsed * 14)
      phase += elapsed * speed

      const breath =
        current.current === "thinking" ? Math.sin(phase * 2.4) * 0.05 : 0

      const swell = energy + sound * 0.45 + breath

      parts.forEach((part, index) => {
        const angle = phase * (0.7 + index * 0.3) + index * 2.1
        const reach = 5 + swell * 6
        const x = Math.cos(angle) * reach
        const y = Math.sin(angle * 1.3) * reach
        const scale = 0.86 + swell * 0.22 + (index === 1 ? sound * 0.08 : 0)

        part.style.transform = `translate(${x.toFixed(2)}%, ${y.toFixed(2)}%) rotate(${(phase * 24 + index * 120).toFixed(1)}deg) scale(${scale.toFixed(3)})`
      })
    }

    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [])

  return (
    <div
      ref={root}
      data-slot="voice-aura"
      data-state={state}
      aria-hidden="true"
      className={cn("voice-aura", className)}
      {...props}
    >
      {blobs.map((index) => (
        <span key={index} data-blob className="voice-aura-blob" />
      ))}
    </div>
  )
}

export { VoiceAura }
