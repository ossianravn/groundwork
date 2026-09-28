import { activityKinds } from "@/demo/activity"

export const defaultActivitySearch = {
  q: "",
  member: "",
  kind: "",
  period: 0,
  page: 1,
  event: "",
}

// URL JSON values are decoded at this boundary before reaching the view.
interface ActivitySearchInput {
  q?: unknown
  member?: unknown
  kind?: unknown
  period?: unknown
  page?: unknown
  event?: unknown
}

export function parseActivitySearch(raw: ActivitySearchInput) {
  function text(value: ActivitySearchInput["q"]) {
    // oxlint-disable-next-line anti-slop/no-runtime-typeof -- This URL boundary accepts strings and discards other JSON representations.
    return typeof value === "string" ? value : ""
  }

  try {
    const period = Number(raw.period)
    const page = Number(raw.page)

    return {
      q: text(raw.q),
      member: text(raw.member),
      kind: Object.hasOwn(activityKinds, text(raw.kind)) ? text(raw.kind) : "",
      period: [7, 14, 30].includes(period) ? period : 0,
      page: Number.isSafeInteger(page) && page > 0 ? page : 1,
      event: text(raw.event),
    }
  } catch {
    // Malformed JSON values that cannot coerce open the default history.
    return defaultActivitySearch
  }
}
