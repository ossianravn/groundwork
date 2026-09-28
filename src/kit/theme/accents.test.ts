import { describe, expect, it } from "vitest"
import theme from "@/kit/styles/theme.css?raw"
import { accents } from "./accents"

// Adding an accent takes a catalog entry and its two blocks in theme.css.
// This keeps either side from shipping without the other.
const brandTokens = [
  "--brand",
  "--brand-foreground",
  "--brand-soft",
  "--brand-soft-foreground",
]

const rules = [...theme.matchAll(/([^{}]+)\{([^{}]*)\}/gu)].map(
  ([, selectors, body]) => ({
    selectors: selectors.split(",").map((selector) => selector.trim()),
    tokens: [...body.matchAll(/(--[\w-]+)\s*:/gu)].map(([, name]) => name),
  }),
)

function tokensFor(selector: string) {
  return rules
    .filter((rule) => rule.selectors.includes(selector))
    .flatMap((rule) => rule.tokens)
}

describe("accent catalog", () => {
  it.each(accents.map((accent) => accent.value))(
    "gives %s a complete light and dark brand palette",
    (value) => {
      const light = tokensFor(`[data-accent="${value}"]`)
      const dark = tokensFor(`.dark [data-accent="${value}"]`)

      expect(light).toEqual(expect.arrayContaining(brandTokens))
      expect(dark).toEqual(expect.arrayContaining(brandTokens))
      expect(tokensFor(`.dark[data-accent="${value}"]`)).toEqual(dark)
    },
  )

  it("styles no accent that the catalog does not offer", () => {
    const styled = new Set(
      [...theme.matchAll(/\[data-accent="([^"]+)"\]/gu)].map(
        ([, name]) => name,
      ),
    )

    expect([...styled].sort()).toEqual(
      accents.map((accent) => accent.value).sort(),
    )
  })
})
