import type { Period } from "./model"

/** A preset length ending on the snapshot date, or chosen first and last dates. */
export type ReportPeriod =
  | { kind: "preset"; days: Period }
  | { kind: "custom"; from: string; to: string }

export function dateOffset(date: string, days: number) {
  const value = new Date(`${date}T00:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)

  return value.toISOString().slice(0, 10)
}

export interface ReportWindow {
  start: string
  end: string
}

/** Custom ranges are limited so daily bars stay readable. */
export const maxReportDays = 92

export function reportWindow(
  reference: string,
  period: ReportPeriod,
): ReportWindow {
  return period.kind === "preset"
    ? { start: dateOffset(reference, 1 - period.days), end: reference }
    : { start: period.from, end: period.to }
}

/** Every date in the window, first to last. */
export function windowDates({ start, end }: ReportWindow) {
  const dates: string[] = []

  for (
    let date = start;
    date <= end && dates.length < maxReportDays;
    date = dateOffset(date, 1)
  )
    dates.push(date)

  return dates
}
