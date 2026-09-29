// Calendar dates travel as ISO strings ("2026-09-28") so forms, URLs and
// JSON stay time-zone free. These helpers convert at the picker boundary.

export interface IsoDateRange {
  from: string
  to: string
}

/** A local Date for a valid ISO calendar date, otherwise undefined. */
export function parseIsoDate(value: string | undefined) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value ?? "")

  if (!match) return undefined

  const [year, month, day] = match.slice(1).map(Number)
  const date = new Date(year, month - 1, day)

  return date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : undefined
}

export function toIsoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${date.getFullYear()}-${month}-${day}`
}

export function formatIsoDate(
  value: string,
  locale = "en-GB",
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" },
) {
  const date = parseIsoDate(value)

  return date ? new Intl.DateTimeFormat(locale, options).format(date) : value
}

/** "11 Sept – 24 Sept 2026"; the year shows once, on the end date. */
export function formatIsoRange(range: IsoDateRange, locale = "en-GB") {
  const startOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
  }

  if (range.from.slice(0, 4) !== range.to.slice(0, 4))
    startOptions.year = "numeric"

  const start = formatIsoDate(range.from, locale, startOptions)

  const end = formatIsoDate(range.to, locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  })

  return `${start} – ${end}`
}

/** Whole days from the first to the last date, counting both. */
export function isoRangeDays(range: IsoDateRange) {
  const from = parseIsoDate(range.from)
  const to = parseIsoDate(range.to)

  if (!from || !to) return 0

  return Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1
}
