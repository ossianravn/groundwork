"use client"

import { useEffect, useMemo, useState, useSyncExternalStore } from "react"
import { previewEvent, previewFrame } from "./preview-frame"
import {
  applyTheme,
  defaultTheme,
  readTheme,
  saveTheme,
  type ThemeSettings,
} from "./preferences"

const subscribeToNothing = () => () => {}

/** False while server rendering and hydrating; true in the browser after that. */
function useHydrated() {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  )
}

export function useTheme({
  defaults = defaultTheme,
}: {
  /**
   * The host's defaults, used when nothing is saved and by Restore defaults.
   * Pass a stable object, such as a module constant.
   */
  defaults?: ThemeSettings
} = {}) {
  const hydrated = useHydrated()
  // Server rendering and hydration use the defaults, so the markup matches;
  // the browser then reads the saved theme, which applyTheme (client-only
  // hosts) or themeScript (server-rendered hosts) already put on <html>.
  const stored = useMemo(
    () => (hydrated ? readTheme(defaults) : null),
    [hydrated, defaults],
  )
  const [chosen, setChosen] = useState<ThemeSettings | null>(null)
  const [saved, setSaved] = useState(true)
  const [message, setMessage] = useState("")
  const current = chosen ?? stored
  const theme = current ?? defaults
  const feedback =
    message ||
    (hydrated && previewFrame() ? "Changes stay in this preview." : "")

  useEffect(() => {
    if (!current) return

    applyTheme(current)

    const query = (
      previewFrame()?.ownerDocument.defaultView ?? window
    ).matchMedia("(prefers-color-scheme: dark)")

    const update = () => applyTheme(current)
    query.addEventListener("change", update)

    return () => query.removeEventListener("change", update)
  }, [current])

  useEffect(() => {
    const update = () => {
      const preview = previewFrame()?.themePreview

      if (preview) {
        setChosen(preview.settings)
        applyTheme(preview.settings)
      }
    }

    window.addEventListener(previewEvent, update)

    return () => window.removeEventListener(previewEvent, update)
  }, [])

  function commitTheme(
    next: ThemeSettings,
    confirmation: string,
    resetColors = false,
  ) {
    const frame = previewFrame()

    if (frame) {
      frame.onPreviewSettingsChange?.(next, resetColors)
      setChosen(next)
      setMessage("Preview updated. Site preferences are unchanged.")

      return
    }

    applyTheme(next)
    setChosen(next)
    const persisted = saveTheme(next)
    setSaved(persisted)
    setMessage(
      persisted
        ? confirmation
        : "Appearance updated for this session, but could not be saved for your next visit.",
    )
  }

  function updateTheme(next: ThemeSettings) {
    commitTheme(next, "Preferences saved on this device.")
  }

  function restoreDefaults() {
    commitTheme(defaults, "Default appearance restored.", true)
  }

  return { theme, saved, feedback, updateTheme, restoreDefaults }
}
