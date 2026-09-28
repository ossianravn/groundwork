import { describe, expect, it } from "vitest"
import { format } from "prettier"
import { registryItemSchema } from "shadcn/schema"
import { newPreset } from "./preset"
import { presetRegistryItem, registryName } from "./preset-registry"

function studio() {
  const preset = newPreset()

  preset.name = "Studio North"
  preset.colors = {
    light: { brand: "oklch(0.52 0.2 28)" },
    dark: { brand: "oklch(0.76 0.12 28)" },
  }

  return preset
}

describe("presetRegistryItem", () => {
  it("is a valid shadcn registry item", () => {
    const result = registryItemSchema.safeParse(presetRegistryItem(studio()))

    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true)
  })

  it("installs the theme file beside kit.css and imports it from there", () => {
    const item = presetRegistryItem(studio())
    const [file] = item.files

    expect(file.target).toBe("src/kit/styles/themes/studio-north.css")
    expect(Object.keys(item.css)).toEqual([
      '@import "./themes/studio-north.css"',
    ])
    expect(file.content).toContain(
      ":root:not(.dark),\n:root:not(.dark)[data-accent] {\n  --brand: oklch(0.52 0.2 28);",
    )
    expect(file.content).toContain(":root.dark,\n:root.dark[data-accent] {")
  })

  // Adopters' format checks cover installed files too.
  it("writes a theme file that a Prettier check accepts", async () => {
    const [file] = presetRegistryItem(studio()).files

    expect(await format(file.content, { parser: "css" })).toBe(file.content)
  })

  it.each([
    ["Studio North", "studio-north"],
    ["  Ümlaut & Co.  ", "umlaut-co"],
    ["***", "groundwork-theme"],
  ])("names %j as %j", (name, expected) => {
    expect(registryName(name)).toBe(expected)
  })
})
