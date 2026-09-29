import { useId } from "react"
import { Check } from "lucide-react"
import { FieldLegend, FieldSet } from "@/kit/ui/field"
import { projectColorStyle } from "@/components/project-color"
import { projectColors } from "@/demo/project-colors"
import type { ProjectColor } from "@/demo/model"

const names: Record<ProjectColor, string> = {
  violet: "Violet",
  teal: "Teal",
  amber: "Amber",
  rose: "Rose",
  green: "Green",
  sky: "Sky",
}

/** The project's identity colour: its dot, progress bar and chart series. */
export function ProjectColorField({
  value,
  onChange,
}: {
  value: ProjectColor
  onChange: (color: ProjectColor) => void
}) {
  const name = useId()

  return (
    <FieldSet className="project-color-field">
      <FieldLegend variant="label">Colour</FieldLegend>
      <div className="project-color-options">
        {projectColors.map((color) => (
          <label
            key={color}
            className="project-color-option"
            style={projectColorStyle(color)}
          >
            <input
              type="radio"
              name={name}
              value={color}
              checked={value === color}
              onChange={() => onChange(color)}
            />
            <span className="project-color-swatch" aria-hidden="true">
              {value === color && <Check />}
            </span>
            <span className="sr-only">{names[color]}</span>
          </label>
        ))}
      </div>
    </FieldSet>
  )
}
