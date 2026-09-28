import { formatHex } from "culori"
import { Field, FieldGroup, FieldLabel } from "@/kit/ui/field"
import { ToggleGroup, ToggleGroupItem } from "@/kit/ui/toggle-group"
import type { ThemePreset } from "@/kit/theme/preset"
import type { ColorMode, ThemeColors } from "@/kit/theme/color-tokens"
import {
  generatePalette,
  tintTokens,
  type ContrastCheck,
  type NeutralTint,
} from "@/kit/theme/palette"
import { ColorField } from "./theme-colors"

const modes: ColorMode[] = ["light", "dark"]

/** The last generation, kept by the host so it survives closing the panel. */
export interface GeneratorState {
  seed: string
  tint: NeutralTint
  checks: ContrastCheck[]
}

/** Builds the brand (and optionally tinted greys) from one colour, live. */
export function ThemeGenerate({
  preset,
  resolved,
  state,
  onChange,
  onStateChange,
}: {
  preset: ThemePreset
  resolved: ThemeColors
  state: GeneratorState | undefined
  onChange: (preset: ThemePreset) => void
  onStateChange: (state: GeneratorState) => void
}) {
  const current = preset.colors.light.brand ?? resolved.light.brand ?? ""
  const seed = state?.seed ?? formatHex(current) ?? current
  const tint = state?.tint ?? "none"
  const checks = state?.checks ?? []

  function generate(nextSeed: string, nextTint: NeutralTint) {
    const palette = generatePalette({
      seed: nextSeed,
      tint: nextTint,
      base: resolved,
    })

    if (!palette)
      return onStateChange({
        ...(state ?? { checks: [] }),
        seed: nextSeed,
        tint: nextTint,
      })
    const colors: ThemeColors = { light: {}, dark: {} }

    // Generated tokens replace their earlier values; other edits stay.
    // Turning the tint off removes only the greys it set.
    for (const mode of modes) {
      colors[mode] = { ...preset.colors[mode] }

      if (nextTint === "none" && tint === "subtle")
        for (const token of tintTokens) delete colors[mode][token]
      Object.assign(colors[mode], palette.colors[mode])
    }

    onChange({ ...preset, colors })
    onStateChange({ seed: nextSeed, tint: nextTint, checks: palette.checks })
  }

  const adjusted = checks.filter((check) => check.adjusted)
  const failing = checks.filter((check) => check.ratio < check.minimum)

  const describe = (list: ContrastCheck[]) =>
    list
      .map((check) => `${check.label.toLowerCase()} (${check.mode})`)
      .join(", ")

  return (
    <FieldGroup className="theme-generate">
      <p className="theme-hint">
        Pick one brand color. Links, fills and soft surfaces are derived for
        light and dark, with lightness adjusted until text stays readable.
      </p>
      <ColorField
        id="theme-seed"
        label="Brand color"
        value={seed}
        onChange={(value) => generate(value, tint)}
      />
      <Field>
        <FieldLabel>Neutral tint</FieldLabel>
        <ToggleGroup
          value={[tint]}
          onValueChange={(values) => {
            const next = values[0]

            if (next === "none" || next === "subtle") generate(seed, next)
          }}
          variant="outline"
          aria-label="Neutral tint"
        >
          <ToggleGroupItem value="none">None</ToggleGroupItem>
          <ToggleGroupItem value="subtle">Subtle</ToggleGroupItem>
        </ToggleGroup>
      </Field>
      <div className="theme-generate-samples">
        {modes.map((mode) => {
          const colors = { ...resolved[mode], ...preset.colors[mode] }

          return (
            <div
              key={mode}
              className="theme-generate-sample"
              style={{ background: colors.background }}
            >
              <span style={{ color: colors.foreground }}>
                {mode === "light" ? "Light" : "Dark"}
              </span>
              <span
                style={{
                  background: colors.brand,
                  color: colors["brand-foreground"],
                }}
              >
                Fill
              </span>
              <span
                style={{
                  background: colors["brand-soft"],
                  color: colors["brand-soft-foreground"],
                }}
              >
                Soft
              </span>
              <span style={{ color: colors.brand }}>Link</span>
            </div>
          )
        })}
      </div>
      <div role="status" className="theme-generate-status">
        {checks.length > 0 &&
          (failing.length
            ? `Below 4.5:1: ${describe(failing)}. Try a different brand color.`
            : adjusted.length
              ? `Adjusted for readability: ${describe(adjusted)}. Every pairing now reaches 4.5:1.`
              : "Every pairing reaches 4.5:1 without adjustment.")}
      </div>
      <p className="theme-hint">
        Generating replaces the brand colors
        {tint === "subtle" ? " and neutral greys" : ""} in both modes; other
        color edits stay. Fine-tune any token in Colors.
      </p>
    </FieldGroup>
  )
}
