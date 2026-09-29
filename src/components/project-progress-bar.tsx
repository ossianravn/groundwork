import type { CSSProperties } from "react"
import { Progress } from "@/kit/ui/progress"
import type { ProjectColor } from "@/demo/model"

type ProgressStyle = CSSProperties & { "--progress-color": string }

/** A project's completion as the kit progress bar, in the project's colour. */
export function ProjectProgressBar({
  color,
  value,
  label,
  className,
}: {
  color: ProjectColor
  value: number
  label: string
  className?: string
}) {
  const style: ProgressStyle = { "--progress-color": `var(--hue-${color})` }

  return (
    <Progress
      value={value}
      aria-label={label}
      className={className}
      style={style}
    />
  )
}
