import type { Period } from "@/demo/model"
import { maxReportDays, type ReportPeriod } from "@/demo/report-period"
import { isoRangeDays, parseIsoDate } from "@/kit/lib/iso-date"

// Overview and Analytics share one URL shape: a preset period, plus from/to
// when a custom range is chosen. An invalid or oversized range falls back to
// the preset, so a shared link never shows an empty or unreadable chart.
export interface ReportPeriodSearch {
  period: Period
  from?: string
  to?: string
}

export function parseReportPeriodSearch(
  raw: { period?: unknown; from?: unknown; to?: unknown },
  fallback: Period,
): ReportPeriodSearch {
  const value = Number(raw.period)
  const period = value === 7 || value === 14 || value === 30 ? value : fallback
  const from = String(raw.from ?? "")
  const to = String(raw.to ?? "")

  const valid =
    !!parseIsoDate(from) &&
    !!parseIsoDate(to) &&
    from <= to &&
    isoRangeDays({ from, to }) <= maxReportDays

  return valid ? { period, from, to } : { period }
}

export function reportPeriodOf(search: ReportPeriodSearch): ReportPeriod {
  return search.from && search.to
    ? { kind: "custom", from: search.from, to: search.to }
    : { kind: "preset", days: search.period }
}

/** Search values for a new choice; a preset clears any custom dates. */
export function reportPeriodSearch(
  next: ReportPeriod,
  current: Period,
): ReportPeriodSearch {
  return next.kind === "preset"
    ? { period: next.days, from: undefined, to: undefined }
    : { period: current, from: next.from, to: next.to }
}
