import { afterEach, expect, it, vi } from "vitest"
import {
  applyTheme,
  defaultTheme,
  readTheme,
  type ThemeRoot,
  type ThemeSettings,
} from "./preferences"
import { themeScript } from "./theme-script"

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// The parts of <html> that applyTheme and the script write.
function fakeRoot() {
  const classes = new Set<string>()
  const properties = new Map<string, string | null>()

  const root: ThemeRoot = {
    classList: {
      toggle: (name, on) => {
        if (on) classes.add(name)
        else classes.delete(name)

        return Boolean(on)
      },
    },
    style: {
      colorScheme: "",
      setProperty: (name, value) => {
        properties.set(name, value)
      },
      removeProperty: (name) => {
        properties.delete(name)

        return ""
      },
    },
    dataset: {},
  }

  const state = () => ({
    dark: classes.has("dark"),
    colorScheme: root.style.colorScheme,
    ...root.dataset,
    font: properties.get("--font-interface"),
  })

  return { root, state }
}

function stubBrowser(saved: string | null, prefersDark: boolean) {
  const matchMedia = () => ({ matches: prefersDark })
  vi.stubGlobal("window", { frameElement: null, matchMedia })
  vi.stubGlobal("localStorage", { getItem: () => saved })
  vi.spyOn(console, "warn").mockImplementation(() => undefined)
}

const hostDefaults: ThemeSettings = {
  ...defaultTheme,
  accent: "neutral",
  font: "inter",
}

it.each([
  ["nothing saved", null, false, defaultTheme],
  [
    "every choice saved",
    '{"appearance":"dark","accent":"teal","radius":"subtle","density":"compact","headerSurface":"solid","font":"inter"}',
    false,
    defaultTheme,
  ],
  [
    "system appearance in a dark OS",
    '{"appearance":"system"}',
    true,
    defaultTheme,
  ],
  [
    "system appearance in a light OS",
    '{"appearance":"system"}',
    false,
    defaultTheme,
  ],
  [
    "unsupported values",
    '{"accent":["teal"],"font":"comic","density":1}',
    false,
    defaultTheme,
  ],
  ["malformed JSON", "{", false, defaultTheme],
  ["host defaults, nothing saved", null, false, hostDefaults],
  [
    "host defaults, some choices saved",
    '{"density":"compact","font":"geist"}',
    false,
    hostDefaults,
  ],
] as const)(
  "applies what applyTheme(readTheme()) applies: %s",
  (_, saved, prefersDark, defaults) => {
    stubBrowser(saved, prefersDark)
    const fromScript = fakeRoot()
    vi.stubGlobal("document", { documentElement: fromScript.root })
    new Function(themeScript({ defaults }))()

    const fromRuntime = fakeRoot()
    vi.stubGlobal("document", { documentElement: fromRuntime.root })
    applyTheme(readTheme(defaults), fromRuntime.root)

    expect(fromScript.state()).toEqual(fromRuntime.state())
  },
)

it("keeps every value inside the script element", () => {
  const script = themeScript({
    // SAFETY: an unsupported font only tests the escaping of the embedded JSON.
    defaults: { ...defaultTheme, font: "</script>" as ThemeSettings["font"] },
  })

  expect(script).not.toContain("</script>")
})
