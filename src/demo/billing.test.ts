import { describe, expect, it } from "vitest"
import { getPlan, planPrice, workspacePlanAmount } from "./billing"
import { parseSignUpSearch } from "@/app/access-search"

describe("sample plan selection", () => {
  it("calculates workspace totals from the full chosen period and current members", () => {
    expect(workspacePlanAmount({ plan: "team", billing: "monthly" }, 4)).toBe(
      48,
    )
    expect(workspacePlanAmount({ plan: "team", billing: "annual" }, 4)).toBe(
      480,
    )
    expect(
      workspacePlanAmount({ plan: "business", billing: "annual" }, 3),
    ).toBe(720)
    expect(
      workspacePlanAmount({ plan: "starter", billing: "monthly" }, 4),
    ).toBe(0)
  })
  it("keeps the monthly equivalent and charged period amount consistent", () => {
    expect(planPrice(getPlan("team"), "annual")).toEqual({
      monthly: "$10",
      basis: "$120 per member, billed yearly",
    })
    expect(planPrice(getPlan("business"), "monthly")).toEqual({
      monthly: "$24",
      basis: "$24 per member, billed monthly",
    })
    expect(planPrice(getPlan("starter"), "annual").basis).toBe(
      "Free — no billing",
    )
  })

  it("retains a valid plan and period without accepting an unknown catalog entry", () => {
    expect(
      parseSignUpSearch({ plan: "team", billing: "annual" }),
    ).toMatchObject({ plan: "team", billing: "annual" })
    expect(
      parseSignUpSearch({ plan: "invented", billing: "annual" }),
    ).toMatchObject({ plan: undefined, billing: undefined })
  })
})
