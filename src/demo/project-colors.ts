import type { ProjectColor } from "./model"

// Order sets the rotation for new projects, so neighbours stay distinct.
export const projectColors: readonly ProjectColor[] = [
  "violet",
  "teal",
  "amber",
  "rose",
  "green",
  "sky",
]

export function isProjectColor(value: string): value is ProjectColor {
  return projectColors.some((color) => color === value)
}

/** The hue a newly created project receives, given how many exist. */
export function nextProjectColor(existing: number): ProjectColor {
  return projectColors[existing % projectColors.length]
}
