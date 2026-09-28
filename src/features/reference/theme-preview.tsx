import { useEffect, useRef, useState } from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/kit/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"
import type { ThemePreset } from "@/kit/theme/preset"
import type { ThemeColors } from "@/kit/theme/color-tokens"
import { previewEvent, type ThemePreviewFrame } from "@/kit/theme/preview-frame"
import { resolvePresetColors } from "@/kit/theme/preset-document"

export interface ThemePreviewPage {
  value: string
  label: string
}

export function ThemePreview({
  preset,
  pages,
  onChange,
  onResolved,
}: {
  preset: ThemePreset
  pages: [ThemePreviewPage, ...ThemePreviewPage[]]
  onChange: (preset: ThemePreset) => void
  onResolved: (colors: ThemeColors) => void
}) {
  const frame = useRef<ThemePreviewFrame>(null)
  const [page, setPage] = useState(pages[0].value)
  const [revision, setRevision] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const node = frame.current

    if (!node) return
    node.themePreview = preset
    node.onPreviewSettingsChange = (settings, resetColors) =>
      onChange({
        ...preset,
        settings,
        colors:
          !resetColors && settings.accent === preset.settings.accent
            ? preset.colors
            : { light: {}, dark: {} },
      })

    if (loaded && node.contentDocument && node.contentWindow) {
      node.contentWindow.dispatchEvent(new Event(previewEvent))
      onResolved(resolvePresetColors(node.contentDocument, preset))
    }
  }, [preset, loaded, onChange, onResolved])

  return (
    <section className="theme-preview" aria-label="Theme preview">
      <div className="theme-preview-toolbar">
        <Select
          items={pages}
          value={page}
          onValueChange={(value) => {
            if (value) {
              setLoaded(false)
              setPage(value)
            }
          }}
        >
          <SelectTrigger aria-label="Preview page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {pages.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setLoaded(false)
            setRevision((value) => value + 1)
          }}
        >
          <RotateCcw data-icon="inline-start" />
          Reset preview
        </Button>
      </div>
      <iframe
        key={`${page}-${revision}`}
        ref={(node) => {
          frame.current = node

          if (frame.current) frame.current.themePreview = preset
        }}
        src={page}
        onLoad={() => setLoaded(true)}
        title={`${pages.find((item) => item.value === page)?.label} theme preview`}
        className="theme-live-frame"
      />
    </section>
  )
}
