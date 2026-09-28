const systemStack =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'

// The catalog owns the available choices and their fallback stacks.
// Font-face imports live together in styles/fonts.css.
export const interfaceFonts = [
  {
    value: "geist",
    label: "Geist",
    family: `"Geist Variable", ${systemStack}`,
  },
  {
    value: "inter",
    label: "Inter",
    family: `"Inter Variable", ${systemStack}`,
  },
  {
    value: "source-sans-3",
    label: "Source Sans 3",
    family: `"Source Sans 3 Variable", ${systemStack}`,
  },
  { value: "system", label: "System", family: systemStack },
] as const

export type InterfaceFont = (typeof interfaceFonts)[number]["value"]

export const defaultInterfaceFont = interfaceFonts[0]

export function resolveInterfaceFont(value: InterfaceFont) {
  return (
    interfaceFonts.find((font) => font.value === value) ?? defaultInterfaceFont
  )
}
