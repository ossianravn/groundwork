import { decodePreset, type ThemePreset } from "./preset"

const key = "awesome-web-template.presets.v1"

export function readPresets() {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "[]")

    if (!Array.isArray(value)) throw new Error("Expected a preset collection.")

    return {
      presets: value.map((preset) => decodePreset(JSON.stringify(preset))),
      error: "",
    }
  } catch (error) {
    console.warn("Saved theme presets could not be read.", error)

    return {
      presets: [],
      error:
        "Saved presets could not be read. Export your work before reloading.",
    }
  }
}

export function writePresets(presets: ThemePreset[]) {
  try {
    localStorage.setItem(key, JSON.stringify(presets))

    return ""
  } catch (error) {
    console.warn("Theme preset could not be saved.", error)

    return "Could not save on this device. Your draft is still here; export it or try again."
  }
}
