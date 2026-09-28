import type { Period } from "@/demo/model"

interface AnalyticsSearch {
  period: Period
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
  project?: unknown
  projectView?: unknown
}): AnalyticsSearch {
  try {
    return {
      period:
        raw.period === 7 || raw.period === "7"
          ? 7
          : raw.period === 14 || raw.period === "14"
            ? 14
            : 30,
      project: String(raw.project ?? ""),
      projectView: raw.projectView === "data" ? "data" : "chart",
    }
  } catch {
    // Uncoercible URL values recover to the default reporting scope.
    return defaultAnalyticsSearch
  }
}
