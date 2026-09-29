import { expect, it } from "vitest"
import { parseCsv } from "./csv"

it("reads quoted commas, escaped quotes, line breaks and CRLF", () => {
  const text =
    '\uFEFFName,Notes\r\n"Launch, phase 2","Say ""hello""\nthen go"\r\n\r\nPlain , value \n'

  expect(parseCsv(text)).toEqual([
    ["Name", "Notes"],
    ["Launch, phase 2", 'Say "hello"\nthen go'],
    ["Plain", "value"],
  ])
})

it("keeps empty cells and a final row without a line break", () => {
  expect(parseCsv("a,,c\n,,\nx,y")).toEqual([
    ["a", "", "c"],
    ["x", "y"],
  ])
})
