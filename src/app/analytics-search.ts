import {
  parseReportPeriodSearch,
  type ReportPeriodSearch,
} from "./report-period-search"

interface AnalyticsSearch extends ReportPeriodSearch {
  project: string
  projectView: "chart" | "data"
  /** Compare with the previous period of the same length. */
  compare: boolean
}

export const defaultAnalyticsSearch: AnalyticsSearch = {
  period: 30,
  project: "",
  projectView: "chart",
  compare: false,
}

export function parseAnalyticsSearch(raw: {
  period?: unknown
  from?: unknown
  to?: unknown
  project?: unknown
  projectView?: unknown
  compare?: unknown
}): AnalyticsSearch {
  try {
    return {
      ...parseReportPeriodSearch(raw, 30),
      project: String(raw.project ?? ""),
      projectView: raw.projectView === "data" ? "data" : "chart",
      compare: raw.compare === true || raw.compare === "true",
    }
  } catch {
    // Uncoercible URL values recover to the default reporting scope.
    return defaultAnalyticsSearch
  }
}
