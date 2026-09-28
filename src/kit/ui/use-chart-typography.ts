import { useEffect, useRef, useState } from "react"

// SVG axes need pixel measurements even though the interface uses rem roles.
export function useChartTypography(labels: readonly string[]) {
  const ref = useRef<HTMLDivElement>(null)

  const [typography, setTypography] = useState({
    fontSize: 12,
    lineHeight: 18,
    fontFamily: "",
    labelWidth: 0,
  })

  useEffect(() => {
    const element = ref.current

    if (!element) return

    const measure = () => {
      const style = getComputedStyle(element)
      const probe = document.createElement("span")
      probe.style.cssText =
        "position:absolute;visibility:hidden;white-space:pre;pointer-events:none"
      element.append(probe)

      const labelWidth = Math.max(
        0,
        ...labels.map((label) => {
          probe.textContent = label

          return probe.getBoundingClientRect().width
        }),
      )

      probe.remove()

      const next = {
        fontSize: parseFloat(style.fontSize),
        lineHeight: parseFloat(style.lineHeight),
        fontFamily: style.fontFamily,
        labelWidth: Math.ceil(labelWidth),
      }

      setTypography((current) =>
        current.fontSize === next.fontSize &&
        current.lineHeight === next.lineHeight &&
        current.fontFamily === next.fontFamily &&
        current.labelWidth === next.labelWidth
          ? current
          : next,
      )
    }

    const resize = new ResizeObserver(measure)
    const theme = new MutationObserver(measure)
    resize.observe(element)
    theme.observe(document.documentElement, { attributes: true })
    document.fonts.addEventListener("loadingdone", measure)
    measure()

    return () => {
      resize.disconnect()
      theme.disconnect()
      document.fonts.removeEventListener("loadingdone", measure)
    }
  }, [labels])

  return { ref, ...typography }
}
