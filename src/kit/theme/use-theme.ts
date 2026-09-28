import { useEffect, useState } from "react"
import { previewEvent, previewFrame } from "./preview-frame"
import {
  applyTheme,
  defaultTheme,
  readTheme,
  saveTheme,
  type ThemeSettings,
} from "./preferences"

export function useTheme() {
  const [theme, setTheme] = useState(readTheme)
  const [saved, setSaved] = useState(true)

  const [feedback, setFeedback] = useState(() =>
    previewFrame() ? "Changes stay in this preview." : "",
  )

  useEffect(() => {
    applyTheme(theme)

    const query = (
      previewFrame()?.ownerDocument.defaultView ?? window
    ).matchMedia("(prefers-color-scheme: dark)")

    const update = () => applyTheme(theme)
    query.addEventListener("change", update)

    return () => query.removeEventListener("change", update)
  }, [theme])

  useEffect(() => {
    const update = () => {
      const preview = previewFrame()?.themePreview

      if (preview) {
        setTheme(preview.settings)
        applyTheme(preview.settings)
      }
    }

    window.addEventListener(previewEvent, update)

    return () => window.removeEventListener(previewEvent, update)
  }, [])

  function commitTheme(
    next: ThemeSettings,
    message: string,
    resetColors = false,
  ) {
    const frame = previewFrame()

    if (frame) {
      frame.onPreviewSettingsChange?.(next, resetColors)
      setTheme(next)
      setFeedback("Preview updated. Site preferences are unchanged.")

      return
    }

    applyTheme(next)
    setTheme(next)
    const persisted = saveTheme(next)
    setSaved(persisted)
    setFeedback(
      persisted
        ? message
        : "Appearance updated for this session, but could not be saved for your next visit.",
    )
  }

  function updateTheme(next: ThemeSettings) {
    commitTheme(next, "Preferences saved on this device.")
  }

  function restoreDefaults() {
    commitTheme(defaultTheme, "Default appearance restored.", true)
  }

  return { theme, saved, feedback, updateTheme, restoreDefaults }
}
