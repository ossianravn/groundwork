/** A run of terminal text with its styling. */
export interface AnsiSpan {
  text: string
  /** A theme colour role, not a literal colour. */
  color?: AnsiColor
  bold?: boolean
  dim?: boolean
  italic?: boolean
  underline?: boolean
}

export type AnsiColor =
  "red" | "green" | "yellow" | "blue" | "magenta" | "cyan" | "gray"

const colors = new Map<number, AnsiColor>([
  [31, "red"],
  [32, "green"],
  [33, "yellow"],
  [34, "blue"],
  [35, "magenta"],
  [36, "cyan"],
  [90, "gray"],
  [91, "red"],
  [92, "green"],
  [93, "yellow"],
  [94, "blue"],
  [95, "magenta"],
  [96, "cyan"],
])

type Style = Omit<AnsiSpan, "text">

// Built from its code so the pattern has no literal control character.
const esc = String.fromCharCode(27)

function apply(style: Style, code: number): Style {
  if (code === 0) return {}

  if (code === 1) return { ...style, bold: true }

  if (code === 2) return { ...style, dim: true }

  if (code === 3) return { ...style, italic: true }

  if (code === 4) return { ...style, underline: true }

  if (code === 22) return { ...style, bold: false, dim: false }

  if (code === 23) return { ...style, italic: false }

  if (code === 24) return { ...style, underline: false }

  if (code === 39) return { ...style, color: undefined }

  // White, black and backgrounds read as the default in both themes.
  const color = colors.get(code)

  return color ? { ...style, color } : style
}

/**
 * Splits text with ANSI SGR escape codes (colour, bold, dim, italic,
 * underline) into styled spans. Other escape sequences are dropped.
 */
export function parseAnsi(input: string): AnsiSpan[] {
  const spans: AnsiSpan[] = []
  const pattern = new RegExp(`${esc}\\[([\\d;]*)([A-Za-z])`, "gu")
  let style: Style = {}
  let index = 0

  for (const match of input.matchAll(pattern)) {
    const start = match.index ?? 0

    if (start > index) spans.push({ ...style, text: input.slice(index, start) })

    if (match[2] === "m")
      style = (match[1] || "0").split(";").map(Number).reduce(apply, style)

    index = start + match[0].length
  }

  if (index < input.length) spans.push({ ...style, text: input.slice(index) })

  return spans
}
