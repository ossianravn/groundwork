import { expect, it } from "vitest"
import { workspaceShortcut } from "./shortcuts"

it("opens only supported shortcuts without taking over typing, composition or overlays", () => {
  const event = {
    key: "?",
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: true,
    repeat: false,
    isComposing: false,
    defaultPrevented: false,
  }

  expect(workspaceShortcut(event, false, false)).toBe("help")
  expect(
    workspaceShortcut(
      { ...event, key: "k", shiftKey: false, ctrlKey: true },
      false,
      false,
    ),
  ).toBe("search")
  expect(workspaceShortcut(event, true, false)).toBeNull()
  expect(workspaceShortcut(event, false, true)).toBeNull()
  expect(
    workspaceShortcut({ ...event, isComposing: true }, false, false),
  ).toBeNull()
  expect(
    workspaceShortcut({ ...event, defaultPrevented: true }, false, false),
  ).toBeNull()
})
