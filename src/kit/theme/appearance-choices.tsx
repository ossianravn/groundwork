import { useId, type ReactNode } from "react"
import { Check } from "lucide-react"
import { FieldSet, FieldLegend } from "@/kit/ui/field"

export function AppearanceChoices<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly { value: T; label: string; preview?: ReactNode }[]
  onChange: (value: T) => void
}) {
  const name = useId()

  return (
    <FieldSet className="appearance-field">
      <FieldLegend>{label}</FieldLegend>
      <div className="appearance-options">
        {options.map((option) => (
          <label className="appearance-choice" key={option.value}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span className="appearance-choice-frame">
              {option.preview ?? (
                <span className="appearance-choice-caption">
                  {option.label}
                </span>
              )}
            </span>
            {option.preview && (
              <span className="appearance-choice-label">{option.label}</span>
            )}
            {value === option.value && (
              <span className="appearance-choice-check" aria-hidden="true">
                <Check />
              </span>
            )}
          </label>
        ))}
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
