import { describe, expect, it } from "vitest"

// React 19 renders a <title> with several children (text plus expressions)
// as an empty title, silently. Each title must be plain text or one expression.
const sources = import.meta.glob<string>(["../**/*.tsx", "!../**/*.test.tsx"], {
  query: "?raw",
  import: "default",
  eager: true,
})

describe("document titles", () => {
  it("give each <title> a single string child", () => {
    const mixed = Object.entries(sources).flatMap(([file, source]) =>
      [...source.matchAll(/<title>([\s\S]*?)<\/title>/gu)].flatMap(
        ([, content]) => {
          const text = content.trim()
          const single = !text.includes("{") || /^\{[\s\S]*\}$/u.test(text)

          return single ? [] : [`${file}: ${text.replace(/\s+/gu, " ")}`]
        },
      ),
    )

    expect(mixed).toEqual([])
  })
})
