import { chartHues } from "@/kit/ui/chart-colors"
import type { Project } from "@/demo/model"

/** Projects in the palette's order, so stacked neighbours stay apart. */
export const inPaletteOrder = (projects: Project[]) =>
  [...projects].sort(
    (a, b) => chartHues.indexOf(a.color) - chartHues.indexOf(b.color),
  )
