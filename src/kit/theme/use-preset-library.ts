import { useState } from "react"
import { newPreset, type ThemePreset } from "./preset"
import { readPresets, writePresets } from "./preset-storage"
import { readTheme } from "./preferences"

export function usePresetLibrary() {
  const [initial] = useState(readPresets)
  const [presets, setPresets] = useState(initial.presets)

  const [baseline, setBaseline] = useState(
    () =>
      initial.presets.at(-1) ?? newPreset(readTheme(), "Current appearance"),
  )

  const [draft, setDraft] = useState(baseline)
  const [error, setError] = useState(initial.error)

  function select(preset: ThemePreset) {
    setBaseline(preset)
    setDraft(preset)
    setError("")
  }

  function save(preset: ThemePreset) {
    const next = [
      ...presets.filter((item) => item.name !== preset.name),
      preset,
    ]

    const failure = writePresets(next)
    setError(failure)

    if (failure) return false
    setPresets(next)
    select(preset)

    return true
  }

  return { presets, baseline, draft, setDraft, select, save, error }
}
