import { interfaceFonts } from "./fonts"
import {
  defaultTheme,
  themeChoices,
  themeStorageKey,
  type ThemeSettings,
} from "./preferences"

// Plain ES5 so no bundler rewrites it: it runs as an inline script, before
// any module loads. It mirrors applyTheme(readTheme(defaults)) for the
// document; theme-script.test.ts keeps the two in agreement.
const source = `function (c) {
  try {
    var saved = null
    try {
      saved = JSON.parse(localStorage.getItem(c.key) || "null")
    } catch (error) {}
    var theme = {}
    for (var key in c.defaults) {
      var value = saved && typeof saved === "object" ? saved[key] : undefined
      theme[key] = c.choices[key].indexOf(value) >= 0 ? value : c.defaults[key]
    }
    var root = document.documentElement
    var dark =
      theme.appearance === "dark" ||
      (theme.appearance === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    root.classList.toggle("dark", dark)
    root.style.colorScheme = dark ? "dark" : "light"
    root.dataset.accent = theme.accent
    root.dataset.radius = theme.radius
    root.dataset.density = theme.density
    root.dataset.headerSurface = theme.headerSurface
    root.style.setProperty("--font-interface", c.fonts[theme.font])
  } catch (error) {}
}`

/**
 * An inline script for server-rendered hosts. Render it first in the
 * document head so the saved appearance applies before the first paint:
 * `<script dangerouslySetInnerHTML={{ __html: themeScript({ defaults }) }} />`.
 * Pass the same defaults to useTheme. Because the script changes `<html>`
 * before hydration, mark that element `suppressHydrationWarning`.
 */
export function themeScript({
  defaults = defaultTheme,
}: { defaults?: ThemeSettings } = {}) {
  const config = {
    key: themeStorageKey,
    defaults,
    choices: themeChoices,
    fonts: Object.fromEntries(
      interfaceFonts.map((font) => [font.value, font.family]),
    ),
  }

  // Escape "<" so no value can close the surrounding script element.
  const json = JSON.stringify(config).replace(/</gu, "\\u003c")

  return `(${source})(${json})`
}
