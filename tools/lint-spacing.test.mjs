import { expect, it } from "vitest"
import { classFindings, cssFindings, tokenFindings } from "./lint-spacing.mjs"

const texts = (found) => found.map((item) => item.text)

it("finds raw Tailwind spacing and lets tokens and zero through", () => {
  const source = `<div className="grid gap-3 px-4 sm:gap-y-2.5 -mt-1 p-[13px] p-0 gap-(--gap-item) max-w-2xl m-auto" />`

  expect(texts(classFindings(source))).toEqual([
    "gap-3",
    "px-4",
    "sm:gap-y-2.5",
    "-mt-1",
    "p-[13px]",
  ])
})

it("finds literal CSS spacing of 3px or more, not tokens or hairlines", () => {
  const source = `
    .a { gap: 0.75rem; }
    .b { padding: var(--inset-card) var(--gap-item); }
    .c { margin-top: -1px; }
    .d { padding-inline: calc(var(--inset-page) - 0.5rem); }
    .e { row-gap: 0; }
  `

  expect(texts(cssFindings(source))).toEqual([
    "gap: 0.75rem",
    "padding-inline: calc(var(--inset-page) - 0.5rem)",
  ])
})

it("finds retired token names, not names that merely start with them", () => {
  const source = "gap: var(--stack-gap); padding: var(--stack-gap-wide);"

  expect(texts(tokenFindings(source, ["--stack-gap"]))).toEqual(["--stack-gap"])
})
