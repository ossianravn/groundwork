import type { CSSProperties } from "react"
import type { ProjectColor } from "@/demo/model"

type ProjectColorStyle = CSSProperties & { "--project-color": string }

/** Exposes a project's hue to its dot, progress bar and other marks. */
export function projectColorStyle(color: ProjectColor): ProjectColorStyle {
  return { "--project-color": `var(--hue-${color})` }
}
