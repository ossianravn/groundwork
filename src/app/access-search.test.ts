import { describe, expect, it } from "vitest"
import {
  accessReturnTo,
  parseAccessSearch,
  parseEmailReceiptSearch,
} from "./access-search"

describe("access return destination", () => {
  it("keeps existing recovery receipts separate from explicitly requested sign-in receipts", () => {
    expect(parseEmailReceiptSearch({}).purpose).toBe("recovery")
    expect(parseEmailReceiptSearch({ purpose: "sign-in" }).purpose).toBe(
      "sign-in",
    )
  })
  it("retains a local project editing destination and its result context", () => {
    const destination =
      "/app/demo/projects/brand/edit?returnTo=%2Fapp%2Fdemo%2Fprojects%3Fview%3Dboard#details"

    expect(accessReturnTo(destination)).toBe(destination)
  })

  it.each([
    "https://other.example/app/demo/projects",
    "//other.example/app/demo/projects",
    "/app/demo/../../../auth/sign-in",
    "/app/demo/not-a-page",
    { returnTo: "/app/demo/projects" },
  ])(
    "falls back for an external or unsupported destination: %s",
    (destination) => {
      expect(parseAccessSearch({ returnTo: destination }).returnTo).toBe(
        "/app/demo/overview?period=14",
      )
    },
  )
})
