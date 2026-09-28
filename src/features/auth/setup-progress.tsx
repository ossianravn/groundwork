import { Check } from "lucide-react"

export function SetupProgress({ step }: { step: 1 | 2 | 3 }) {
  return (
    <nav aria-label="Workspace setup" className="setup-progress">
      <ol>
        {["Workspace", "Team", "Ready"].map((label, index) => (
          <li
            key={label}
            aria-current={step === index + 1 ? "step" : undefined}
            data-complete={step > index + 1}
          >
            <span aria-hidden="true">
              {step > index + 1 ? <Check /> : index + 1}
            </span>
            {label}
            {step > index + 1 && <span className="sr-only"> completed</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}
