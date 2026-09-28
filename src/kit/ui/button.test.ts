import { describe, expect, it } from "vitest"
import { buttonVariants } from "./button"

// Links styled with buttonVariants() receive the class string directly, so
// conflicting base and variant classes must already be resolved.
describe("buttonVariants", () => {
  it("lets the outline variant's border replace the base transparent border", () => {
    const classes = buttonVariants({ variant: "outline" }).split(" ")

    expect(classes).toContain("border-input")
    expect(classes).not.toContain("border-transparent")
  })

  it("keeps one minimum height for a sized link", () => {
    const heights = buttonVariants({ size: "sm" })
      .split(" ")
      .filter((name) => name.startsWith("min-h-"))

    expect(heights).toEqual(["min-h-(--control-height-sm)"])
  })
})
