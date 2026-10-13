import { renderToString } from "react-dom/server"
import { afterEach, expect, it, vi } from "vitest"
import { defaultTheme, type ThemeSettings } from "./preferences"
import { useTheme } from "./use-theme"

afterEach(() => {
  vi.unstubAllGlobals()
})

function Probe({ defaults }: { defaults?: ThemeSettings }) {
  const { theme } = useTheme({ defaults })

  return <p>{`${theme.appearance} ${theme.accent} ${theme.font}`}</p>
}

it("server-renders the host's defaults without reading storage", () => {
  // Server rendering has no window; storage must not be read before hydration.
  vi.stubGlobal("localStorage", {
    getItem: () => {
      throw new Error("Storage read during server rendering")
    },
  })

  expect(renderToString(<Probe />)).toContain("light indigo geist")
  expect(
    renderToString(
      <Probe
        defaults={{ ...defaultTheme, accent: "neutral", font: "inter" }}
      />,
    ),
  ).toContain("light neutral inter")
})
