/** A signed change for headings: +12, −5 or no change. */
export function signed(value: number, unit = "") {
  if (!value) return "no change"

  const sign = value > 0 ? "+" : "−"

  return `${sign}${Math.abs(Number(value.toFixed(1)))}${unit}`
}
