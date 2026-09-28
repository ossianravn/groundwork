import { useEffect, useRef } from "react"

// Anchor clearance follows the actual sticky header, including text reflow.
export function useHeaderOffset() {
  const header = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = header.current

    if (!element) return
    const root = document.documentElement

    const measure = () => {
      root.style.setProperty(
        "--header-offset",
        `${element.getBoundingClientRect().height}px`,
      )
    }

    const observer = new ResizeObserver(measure)
    observer.observe(element)
    measure()

    return () => {
      observer.disconnect()
      root.style.removeProperty("--header-offset")
    }
  }, [])

  return header
}
