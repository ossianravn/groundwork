import {
  parseReportPeriodSearch,
  type ReportPeriodSearch,
} from "./report-period-search"

interface AnalyticsSearch extends ReportPeriodSearch {
  project: string
  projectView: "chart" | "data"
}

export const defaultAnalyticsSearch: AnalyticsSearch = {
  period: 30,
  project: "",
  projectView: "chart",
}

export function parseAnalyticsSearch(raw: {
  period?: unknown
  from?: unknown
  to?: unknown
  project?: unknown
  projectView?: unknown
}): AnalyticsSearch {
  try {
    return {
      ...parseReportPeriodSearch(raw, 30),
      project: String(raw.project ?? ""),
      projectView: raw.projectView === "data" ? "data" : "chart",
    }
  } catch {
    // Uncoercible URL values recover to the default reporting scope.
    return defaultAnalyticsSearch
  }
}
