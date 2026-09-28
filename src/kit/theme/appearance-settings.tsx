import { FieldGroup } from "@/kit/ui/field"
import { AppearanceChoices, AppearancePreview } from "./appearance-choices"
import { FontSelector } from "./font-selector"
import type { ThemeSettings } from "./preferences"

export function AppearanceSettings({
  theme,
  onChange,
}: {
  theme: ThemeSettings
  onChange: (theme: ThemeSettings) => void
}) {
  return (
    <div className="appearance-settings">
      <FieldGroup className="appearance-section">
        <AppearanceChoices
          label="Theme"
          value={theme.appearance}
          options={(
            [
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
              { value: "system", label: "System" },
            ] as const
          ).map((option) => ({
            ...option,
            preview: <AppearancePreview mode={option.value} />,
          }))}
          onChange={(appearance) => onChange({ ...theme, appearance })}
        />
        <AppearanceChoices
          label="Accent color"
          value={theme.accent}
          options={(
            [
              { value: "indigo", label: "Indigo" },
              { value: "teal", label: "Teal" },
              { value: "neutral", label: "Neutral" },
            ] as const
          ).map((option) => ({
            ...option,
            preview: (
              <span className="appearance-accent-preview" aria-hidden="true">
                <span data-swatch={option.value} />
              </span>
            ),
          }))}
          onChange={(accent) => onChange({ ...theme, accent })}
        />
        <FontSelector
          value={theme.font}
          onChange={(font) => onChange({ ...theme, font })}
        />
      </FieldGroup>
      <FieldGroup className="appearance-section">
        <AppearanceChoices
          label="Density"
          value={theme.density}
          options={(
            [
              { value: "comfortable", label: "Comfortable" },
              { value: "compact", label: "Compact" },
            ] as const
          ).map((option) => ({
            ...option,
            preview: <AppearancePreview mode={option.value} />,
          }))}
          onChange={(density) => onChange({ ...theme, density })}
        />
        <AppearanceChoices
          label="Corners"
          value={theme.radius}
          options={[
            { value: "subtle", label: "Subtle" },
            { value: "rounded", label: "Rounded" },
          ]}
          onChange={(radius) => onChange({ ...theme, radius })}
        />
        <AppearanceChoices
          label="Header surface"
          value={theme.headerSurface}
          options={[
            { value: "glass", label: "Glass" },
            { value: "solid", label: "Solid" },
            { value: "system", label: "System" },
          ]}
          onChange={(headerSurface) => onChange({ ...theme, headerSurface })}
        />
      </FieldGroup>
    </div>
  )
}
