/**
 * Parse comma-separated text (RFC 4180): quoted fields may contain commas,
 * quotes ("") and line breaks. Blank lines are skipped; a leading byte-order
 * mark is ignored. Returns rows of trimmed cells.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let quoted = false
  const source = text.replace(/^\uFEFF/u, "")

  const endRow = () => {
    row.push(cell.trim())

    if (row.some((value) => value !== "")) rows.push(row)

    row = []
    cell = ""
  }

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]

    if (quoted) {
      if (char === '"' && source[index + 1] === '"') {
        cell += '"'
        index += 1
      } else if (char === '"') {
        quoted = false
      } else {
        cell += char
      }
    } else if (char === '"') {
      quoted = true
    } else if (char === ",") {
      row.push(cell.trim())
      cell = ""
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[index + 1] === "\n") index += 1

      endRow()
    } else {
      cell += char
    }
  }

  if (cell !== "" || row.length > 0) endRow()

  return rows
}
