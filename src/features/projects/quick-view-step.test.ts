import { expect, it } from "vitest"
import { quickViewStep } from "./quick-view-step"

const press = (key: string, extra: Partial<KeyboardEvent> = {}) => ({
  key,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  defaultPrevented: false,
  ...extra,
})

it("steps with J and K inside the list and stops at its ends", () => {
  const middle = { index: 1, count: 3 }

  expect(quickViewStep(press("j"), middle, false)).toBe(1)
  expect(quickViewStep(press("K"), middle, false)).toBe(-1)
  expect(quickViewStep(press("k"), { index: 0, count: 3 }, false)).toBeNull()
  expect(quickViewStep(press("j"), { index: 2, count: 3 }, false)).toBeNull()
  expect(quickViewStep(press("x"), middle, false)).toBeNull()
})

it("leaves typing, modified keys and handled events alone", () => {
  const middle = { index: 1, count: 3 }

  expect(quickViewStep(press("j"), middle, true)).toBeNull()

  expect(quickViewStep(press("j", { ctrlKey: true }), middle, false)).toBeNull()
  expect(quickViewStep(press("j", { metaKey: true }), middle, false)).toBeNull()
  expect(
    quickViewStep(press("j", { defaultPrevented: true }), middle, false),
  ).toBeNull()
})
