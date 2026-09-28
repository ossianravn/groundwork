import type { ThemePreset } from "./preset"
import type { ThemeSettings } from "./preferences"

// Same-origin frame contract owned by the playground host. No storage or messaging service.
export interface ThemePreviewFrame extends HTMLIFrameElement {
  themePreview?: ThemePreset
  onPreviewSettingsChange?: (
    settings: ThemeSettings,
    resetColors: boolean,
  ) => void
}

export const previewEvent = "forma-theme-preview"

export function previewFrame(): ThemePreviewFrame | null {
  const element = window.frameElement

  if (element?.tagName !== "IFRAME") return null
  // SAFETY: this is an iframe; the host-owned extension fields are optional and checked below.
  const frame = element as ThemePreviewFrame

  return frame?.themePreview ? frame : null
}
