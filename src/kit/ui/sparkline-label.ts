/** The words a sparkline's label usually needs: from, to and over how long. */
export function trendLabel(values: number[], period: string) {
  const first = values[0]
  const last = values[values.length - 1]

  if (first === undefined || last === undefined) return ""

  if (first === last) return `Unchanged at ${last} over ${period}`

  return `${last > first ? "Up" : "Down"} from ${first} to ${last} over ${period}`
}
