import { useEffect, useState } from "react"
import type { AgentStep } from "@/demo/coding-agent"

/** How far a step has got: hidden, working (with output lines so far) or done. */
export type StepProgress =
  { visible: false } | { visible: true; running: boolean; lines: number }

interface Frame {
  step: number
  running: boolean
  lines: number
  /** Milliseconds before this frame shows. */
  delay: number
}

// Each step starts working, then finishes; test runs print line by line.
function framesFor(step: AgentStep, index: number): Frame[] {
  const done = { step: index, running: false, lines: Infinity }
  const start = { step: index, running: true, lines: 0 }

  switch (step.kind) {
    case "prompt":
      return [{ ...done, delay: 0 }]
    case "reasoning":
    case "text":
      return [
        { ...start, delay: 400 },
        { ...done, delay: 1400 },
      ]
    case "tests":
      return [
        { ...start, delay: 500 },
        ...step.run.output.map((_, line) => ({
          ...start,
          lines: line + 1,
          delay: 60,
        })),
        { ...done, delay: 400 },
      ]
    default:
      return [
        { ...start, delay: 500 },
        { ...done, delay: 800 },
      ]
  }
}

/**
 * Replays a recorded session one frame at a time. It starts complete, so
 * the whole session can be read at once; replay() plays it from the prompt
 * and showAll() skips to the end.
 */
export function useReplay(steps: AgentStep[]) {
  const [frames] = useState(() => steps.flatMap(framesFor))
  const [position, setPosition] = useState(frames.length)
  const playing = position < frames.length
  const next = frames[position]

  useEffect(() => {
    if (!next) return

    const timer = window.setTimeout(
      () => setPosition((current) => current + 1),
      next.delay,
    )

    return () => window.clearTimeout(timer)
  }, [next])

  function progress(index: number): StepProgress {
    const current = frames[position - 1]

    if (!playing || !current || index < current.step)
      return { visible: true, running: false, lines: Infinity }

    if (index > current.step) return { visible: false }

    return { visible: true, running: current.running, lines: current.lines }
  }

  return {
    playing,
    progress,
    replay: () => setPosition(1),
    showAll: () => setPosition(frames.length),
  }
}
