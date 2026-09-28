import { useEffect, useRef, useState } from "react"
import type { ContentSection } from "./content"

export function useReaderScrollspy(sections: ContentSection[]) {
  const contentRef = useRef<HTMLElement>(null)
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const content = contentRef.current

    if (!content) return
    const root = document.documentElement
    const ids = new Set(sections.map((section) => section.id))

    const headings = Array.from(
      content.querySelectorAll<HTMLElement>("h2[id]"),
    ).filter((heading) => ids.has(heading.id))

    let frame = 0

    const measure = () => {
      frame = 0

      // Match native anchor clearance, including the measured sticky header.
      const offset =
        Number.parseFloat(getComputedStyle(root).scrollPaddingTop) || 0

      let current = headings[0]?.id ?? null

      for (const heading of headings) {
        if (heading.getBoundingClientRect().top > offset + 1) break
        current = heading.id
      }

      const last = headings.at(-1)

      // Short final sections may not reach the anchor line before the page ends.
      if (
        last &&
        window.scrollY > 0 &&
        Math.ceil(window.scrollY + window.innerHeight) >= root.scrollHeight &&
        last.getBoundingClientRect().top < window.innerHeight
      ) {
        current = last.id
      }

      setActiveId(current)
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }

    const observer = new ResizeObserver(schedule)
    observer.observe(content)
    observer.observe(root)
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    window.addEventListener("hashchange", schedule)
    schedule()

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      window.removeEventListener("hashchange", schedule)
    }
  }, [sections])

  return { contentRef, activeId }
}
