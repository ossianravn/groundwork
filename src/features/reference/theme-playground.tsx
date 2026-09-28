import { useState } from "react"
import { Button } from "@/kit/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from "@/kit/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/kit/ui/toggle-group"
import { newPreset, samePreset, type ThemePreset } from "@/kit/theme/preset"
import { defaultTheme } from "@/kit/theme/preferences"
import type { ThemeColors } from "@/kit/theme/color-tokens"
import { ThemePreview, type ThemePreviewPage } from "./theme-preview"
import { ThemeCustomize } from "./theme-customize"
import { ThemeSave } from "./theme-save"
import { ThemeTransfer } from "./theme-transfer"
import { accents } from "@/kit/theme/accents"

// Each shipped accent is a starting preset; the catalog sets names and order.
const builtIns = accents.map((accent) =>
  newPreset({ ...defaultTheme, accent: accent.value }, accent.label),
)

export function ThemePlayground({
  draft,
  pages,
  baseline,
  presets,
  error,
  onChange,
  onSelect,
  onSave,
}: {
  draft: ThemePreset
  pages: [ThemePreviewPage, ...ThemePreviewPage[]]
  baseline: ThemePreset
  presets: ThemePreset[]
  error: string
  onChange: (preset: ThemePreset) => void
  onSelect: (preset: ThemePreset) => void
  onSave: (preset: ThemePreset) => boolean
}) {
  const [resolved, setResolved] = useState<ThemeColors>({ light: {}, dark: {} })
  const dirty = !samePreset(draft, baseline)
  const ready = !!resolved.light.primary
  const exported = { ...draft, colors: resolved }

  const choices = [
    { value: "current", label: baseline.name },
    ...builtIns.map((item, i) => ({ value: `shipped-${i}`, label: item.name })),
    ...presets.map((item, i) => ({ value: `saved-${i}`, label: item.name })),
  ]

  return (
    <div className="reference-stack theme-playground">
      <header className="reference-heading">
        <h1>Theme playground</h1>
        <p>
          Try a style on real pages. Drafts stay in the preview; saved presets
          stay on this device.
        </p>
      </header>
      <div className="theme-toolbar">
        <Select
          items={choices}
          value="current"
          onValueChange={(value) => {
            if (!value || value === "current") return
            const [source, index] = value.split("-")

            const selected = (source === "shipped" ? builtIns : presets)[
              Number(index)
            ]

            if (selected) onSelect(selected)
          }}
        >
          <SelectTrigger
            className="theme-preset-trigger"
            aria-label="Theme preset"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Current</SelectLabel>
              <SelectItem value="current">{baseline.name}</SelectItem>
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Shipped</SelectLabel>
              {builtIns.map((item, i) => (
                <SelectItem key={item.name} value={`shipped-${i}`}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectGroup>
            {presets.length > 0 && (
              <SelectGroup>
                <SelectLabel>Saved on this device</SelectLabel>
                {presets.map((item, i) => (
                  <SelectItem key={item.name} value={`saved-${i}`}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            )}
          </SelectContent>
        </Select>
        <ToggleGroup
          className="theme-mode-toggle"
          value={[draft.settings.appearance]}
          onValueChange={(values) => {
            const appearance = values[0]

            if (
              appearance === "light" ||
              appearance === "dark" ||
              appearance === "system"
            )
              onChange({
                ...draft,
                settings: { ...draft.settings, appearance },
              })
          }}
          variant="outline"
          aria-label="Preview color mode"
        >
          <ToggleGroupItem value="light">Light</ToggleGroupItem>
          <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
          <ToggleGroupItem value="system">System</ToggleGroupItem>
        </ToggleGroup>
        <ThemeCustomize
          preset={draft}
          resolved={resolved}
          onChange={onChange}
        />
        <div className="theme-save-actions">
          <ThemeTransfer preset={exported} ready={ready} onImport={onChange} />
          <ThemeSave
            preset={exported}
            names={presets.map((item) => item.name)}
            error={error}
            onSave={onSave}
            disabled={!ready}
          />
        </div>
      </div>
      <div className="theme-draft-status">
        <span role="status">{dirty ? "Unsaved changes" : baseline.name}</span>
        <Button
          variant="ghost"
          size="sm"
          disabled={!dirty}
          onClick={() => onChange(baseline)}
        >
          Discard changes
        </Button>
      </div>
      {error && (
        <p role="alert" className="theme-hint">
          {error}
        </p>
      )}
      <ThemePreview
        pages={pages}
        preset={draft}
        onChange={onChange}
        onResolved={setResolved}
      />
    </div>
  )
}
