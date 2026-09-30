import { describe, expect, it } from "vitest"
import { parseAnsi } from "./ansi"

const esc = String.fromCharCode(27)

describe("parseAnsi", () => {
  it("returns plain text as one span", () => {
    expect(parseAnsi("done")).toEqual([{ text: "done" }])
  })

  it("maps colours to theme roles and resets them", () => {
    expect(
      parseAnsi(`${esc}[31mfail${esc}[39m ok ${esc}[92mpass${esc}[0m`),
    ).toEqual([
      { text: "fail", color: "red" },
      { text: " ok ", color: undefined },
      { text: "pass", color: "green" },
    ])
  })

  it("combines codes in one sequence and clears bold and dim together", () => {
    expect(parseAnsi(`${esc}[1;33mwarn${esc}[22m note`)).toEqual([
      { text: "warn", bold: true, color: "yellow" },
      { text: " note", bold: false, dim: false, color: "yellow" },
    ])
  })

  it("drops other escape sequences and ignores unknown codes", () => {
    expect(parseAnsi(`a${esc}[2Kb${esc}[37mc`)).toEqual([
      { text: "a" },
      { text: "b" },
      { text: "c" },
    ])
  })
})
