import { expect, it } from "vitest"
import {
  parseReportPeriodSearch,
  reportPeriodOf,
  reportPeriodSearch,
} from "./report-period-search"

it("keeps a valid custom range and falls back to the preset otherwise", () => {
  const custom = parseReportPeriodSearch(
    { period: "7", from: "2026-08-01", to: "2026-09-20" },
    14,
  )

  expect(custom).toEqual({ period: 7, from: "2026-08-01", to: "2026-09-20" })
  expect(reportPeriodOf(custom)).toEqual({
    kind: "custom",
    from: "2026-08-01",
    to: "2026-09-20",
  })

  for (const range of [
    { from: "2026-09-20", to: "2026-08-01" },
    { from: "2026-02-30", to: "2026-03-02" },
    { from: "2026-01-01", to: "2026-09-20" },
    { from: "2026-08-01" },
  ])
    expect(parseReportPeriodSearch({ period: 99, ...range }, 14)).toEqual({
      period: 14,
    })

  expect(reportPeriodSearch({ kind: "preset", days: 30 }, 7)).toEqual({
    period: 30,
    from: undefined,
    to: undefined,
  })
  expect(
    reportPeriodSearch(
      { kind: "custom", from: "2026-09-01", to: "2026-09-10" },
      7,
    ),
  ).toEqual({ period: 7, from: "2026-09-01", to: "2026-09-10" })
})
