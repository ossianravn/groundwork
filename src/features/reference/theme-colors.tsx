import { useState } from "react"
import { parse, formatHex, wcagContrast } from "culori"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/kit/ui/field"
import { Input } from "@/kit/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/kit/ui/toggle-group"
import {
  colorTokens,
  type ColorToken,
  type ColorMode,
  type ThemeColors,
} from "@/kit/theme/color-tokens"
import type { ThemePreset } from "@/kit/theme/preset"

function ColorField({
  token,
  value,
  onChange,
}: {
  token: ColorToken
  value: string
  onChange: (value: string) => void
}) {
  const [text, setText] = useState(value)
  const valid = !!parse(text)

  return (
    <Field data-invalid={!valid}>
      <FieldLabel htmlFor={`token-${token}`}>--{token}</FieldLabel>
      <div className="theme-color-input">
        <input
          type="color"
          aria-label={`Pick ${token}`}
          value={formatHex(value) ?? "#000000"}
          onChange={(event) => {
            setText(event.target.value)
            onChange(event.target.value)
          }}
        />
        <Input
          id={`token-${token}`}
          value={text}
          aria-invalid={!valid}
          aria-describedby={!valid ? `error-${token}` : undefined}
          onChange={(event) => {
            setText(event.target.value)

            if (parse(event.target.value)) onChange(event.target.value)
          }}
        />
      </div>
      {!valid && (
        <FieldError id={`error-${token}`}>
          Enter a CSS color, such as #5b4de0 or oklch(0.51 0.195 278).
        </FieldError>
      )}
    </Field>
  )
}

export function ThemeColorsEditor({
  preset,
  resolved,
  onChange,
}: {
  preset: ThemePreset
  resolved: ThemeColors
  onChange: (preset: ThemePreset) => void
}) {
  const mode: ColorMode =
    preset.settings.appearance === "dark" ||
    (preset.settings.appearance === "system" &&
      matchMedia("(prefers-color-scheme: dark)").matches)
      ? "dark"
      : "light"

  const [token, setToken] = useState<ColorToken>("primary")
  const tokens = colorTokens.map((value) => ({ value, label: `--${value}` }))
  const value = preset.colors[mode][token] ?? resolved[mode][token] ?? ""
  const paired = colorTokens.find((item) => item === `${token}-foreground`)

  function change(key: ColorToken, color: string) {
    onChange({
      ...preset,
      colors: {
        ...preset.colors,
        [mode]: { ...preset.colors[mode], [key]: color },
      },
    })
  }

  return (
    <FieldGroup>
      <Field>
        <FieldLabel>Editing color mode</FieldLabel>
        <ToggleGroup
          value={[mode]}
          onValueChange={(values) => {
            const appearance = values[0]

            if (appearance === "light" || appearance === "dark")
              onChange({
                ...preset,
                settings: { ...preset.settings, appearance },
              })
          }}
          variant="outline"
          aria-label="Editing color mode"
        >
          <ToggleGroupItem value="light">Light</ToggleGroupItem>
          <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
        </ToggleGroup>
      </Field>
      <Field>
        <FieldLabel htmlFor="theme-token">Semantic token</FieldLabel>
        <Select
          items={tokens}
          value={token}
          onValueChange={(next) => {
            if (next) setToken(next)
          }}
        >
          <SelectTrigger id="theme-token">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {tokens.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      {value && (
        <ColorField
          key={`${mode}-${token}`}
          token={token}
          value={value}
          onChange={(color) => change(token, color)}
        />
      )}
      {paired && (
        <ColorField
          key={`${mode}-${paired}`}
          token={paired}
          value={preset.colors[mode][paired] ?? resolved[mode][paired] ?? ""}
          onChange={(color) => change(paired, color)}
        />
      )}
      <p className="theme-hint">
        Edits affect this mode only. Hex, RGB and OKLCH values are supported.
        Selecting a shipped palette restores its color tokens.
      </p>
    </FieldGroup>
  )
}

const pairs: {
  label: string
  text: ColorToken
  surface: ColorToken
  minimum: number
}[] = [
  {
    label: "Body text",
    text: "foreground",
    surface: "background",
    minimum: 4.5,
  },
  {
    label: "Card text",
    text: "card-foreground",
    surface: "card",
    minimum: 4.5,
  },
  {
    label: "Muted text on card",
    text: "muted-foreground",
    surface: "card",
    minimum: 4.5,
  },
  {
    label: "Primary action",
    text: "primary-foreground",
    surface: "primary",
    minimum: 4.5,
  },
  {
    label: "Popover text",
    text: "popover-foreground",
    surface: "popover",
    minimum: 4.5,
  },
  {
    label: "Link on background",
    text: "brand",
    surface: "background",
    minimum: 4.5,
  },
  { label: "Focus color on card", text: "ring", surface: "card", minimum: 3 },
]

export function ThemeContrast({ colors }: { colors: ThemeColors }) {
  function ratio(mode: ColorMode, pair: (typeof pairs)[number]) {
    const a = parse(colors[mode][pair.text] ?? "")
    const b = parse(colors[mode][pair.surface] ?? "")

    if (!a || !b || (a.alpha ?? 1) < 1 || (b.alpha ?? 1) < 1)
      return "Not measured"
    const contrast = wcagContrast(a, b)

    return `${contrast.toFixed(2)}:1 · ${contrast >= pair.minimum ? "Meets" : "Below"} ${pair.minimum}:1`
  }

  return (
    <div className="reference-prose theme-contrast">
      <p>
        Selected text pairs use 4.5:1; the focus color uses 3:1. These checks do
        not establish full accessibility conformance. Transparent pairs and
        actual composited focus rings need inspection in context.
      </p>
      <dl>
        {pairs.map((pair) => (
          <div key={pair.label}>
            <dt>{pair.label}</dt>
            <dd>
              Light: {ratio("light", pair)}
              <br />
              Dark: {ratio("dark", pair)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
