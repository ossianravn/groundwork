import { useEffect, useRef, useState } from "react"

export type CopyState = "idle" | "copied" | "failed"

/**
 * Copies text to the clipboard and reports the outcome for a short while.
 * When the clipboard refuses, the caller's fallback element is selected so
 * the person can copy it themselves.
 */
export function useCopy(resetAfter = 2000) {
  const [state, setState] = useState<CopyState>("idle")
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function copy(text: string, fallback?: HTMLElement | null) {
    window.clearTimeout(timer.current)

    try {
      await navigator.clipboard.writeText(text)
      setState("copied")
      timer.current = window.setTimeout(() => setState("idle"), resetAfter)
    } catch {
      setState("failed")

      if (fallback) {
        const range = document.createRange()
        range.selectNodeContents(fallback)
        window.getSelection()?.removeAllRanges()
        window.getSelection()?.addRange(range)
      }
    }
  }

  return { state, copy }
}
