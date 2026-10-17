"use client"

import { useId, type ReactNode } from "react"
import { Check } from "lucide-react"
import { FieldSet, FieldLegend } from "@/kit/ui/field"

/**
 * One appearance choice as radios. Options with a preview are tiles, ringed
 * with a check badge when chosen; the others form one segmented control
 * whose chosen segment takes the toggle group's fill. A `mark`, such as an
 * accent swatch, leads a segment's label.
 */
export function AppearanceChoices<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly {
    value: T
    label: string
    preview?: ReactNode
    mark?: ReactNode
  }[]
  onChange: (value: T) => void
}) {
  const name = useId()
  const tiles = options.some((option) => option.preview)

  return (
    <FieldSet className="appearance-field">
      <FieldLegend>{label}</FieldLegend>
      <div
        className="appearance-options"
        data-kind={tiles ? "tiles" : "segmented"}
      >
        {options.map((option) => {
          const checked = value === option.value

          return (
            <label className="appearance-choice" key={option.value}>
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
              />
              <span className="appearance-choice-frame">
                {option.preview ?? (
                  <span className="appearance-choice-caption">
                    {option.mark}
                    {option.label}
                  </span>
                )}
                {option.preview && checked && (
                  <span className="appearance-choice-check" aria-hidden="true">
                    <Check />
                  </span>
                )}
              </span>
              {option.preview && (
                <span className="appearance-choice-label">{option.label}</span>
              )}
            </label>
          )
        })}
      </div>
    </FieldSet>
  )
}

export function AppearancePreview({
  mode,
}: {
  mode: "light" | "dark" | "system" | "comfortable" | "compact"
}) {
  return (
    <span className="appearance-miniature" data-mode={mode} aria-hidden="true">
      <span className="appearance-mini-nav">
        <i />
        <i />
        <i />
      </span>
      <span className="appearance-mini-content">
        <span className="appearance-mini-heading" />
        <span className="appearance-mini-cards">
          <i />
          <i />
          <i />
        </span>
        <span className="appearance-mini-lines">
          <i />
          <i />
          <i />
        </span>
      </span>
    </span>
  )
}
