import { describe, expect, it } from "vitest"

// Kit stylesheets may only style markup that kit components render. Demo
// classes belong in src/styles, where the demo entry layers them afterwards.
const styles = import.meta.glob<string>("./styles/*.css", {
  query: "?raw",
  import: "default",
  eager: true,
})

const sources = import.meta.glob<string>(
  ["./**/*.{ts,tsx}", "!./**/*.test.*"],
  { query: "?raw", import: "default", eager: true },
)

const kitSource = Object.values(sources).join("\n")

const external = /^(dark|recharts-.+)$/u

function selectorClasses(css: string) {
  const blocks = css.replace(/\/\*[\s\S]*?\*\//gu, "").matchAll(/([^{};]+)\{/gu)

  return [...blocks].flatMap(([, selector]) =>
    selector.trim().startsWith("@")
      ? []
      : [...selector.matchAll(/\.(-?[a-z_][\w-]*)/giu)].map(([, name]) => name),
  )
}

function rendersClass(name: string) {
  return new RegExp(`["'\`\\s]${name}(?=["'\`\\s])`, "u").test(kitSource)
}

// Forced-colors focus rules must outrank component utilities, so they stay
// global; everything else a primitive looks like belongs in its component.
function withoutForcedColors(css: string): string {
  const start = css.indexOf("@media (forced-colors: active)")

  if (start < 0) return css

  let depth = 0

  for (let index = css.indexOf("{", start); index < css.length; index += 1) {
    if (css[index] === "{") depth += 1

    if (css[index] === "}" && --depth === 0)
      return withoutForcedColors(css.slice(0, start) + css.slice(index + 1))
  }

  return css
}

// A selector whose first compound is a primitive slot (or Button), qualified
// only by attributes and states, styles the primitive itself.
function isPrimitiveRule(selector: string) {
  let flat = selector.trim()

  while (/\([^()]*\)/u.test(flat)) flat = flat.replace(/\([^()]*\)/gu, "")

  const [compound] = flat.split(/\s*[\s>+~]\s*/u)
  const owner = /^(input|textarea)?(\[data-slot="[^"]+"\]|\.ui-button)/u

  return owner.test(compound) && !/\.(?!ui-button\b)[a-z]/iu.test(compound)
}

describe("kit boundary", () => {
  it("styles only classes that kit components render", () => {
    const foreign = Object.entries(styles).flatMap(([file, css]) =>
      [...new Set(selectorClasses(css))].flatMap((name) =>
        external.test(name) || rendersClass(name) ? [] : [`${file}: .${name}`],
      ),
    )

    expect(foreign).toEqual([])
  })

  it("imports no stylesheet outside the kit", () => {
    const imports = Object.entries(styles).flatMap(([file, css]) =>
      [...css.matchAll(/@import\s+"(\.\.\/[^"]+)"/gu)].map(
        ([, path]) => `${file}: ${path}`,
      ),
    )

    expect(imports).toEqual([])
  })

  it("leaves primitive appearance to the primitive components", () => {
    const global = Object.entries(styles).flatMap(([file, css]) =>
      [
        ...withoutForcedColors(css)
          .replace(/\/\*[\s\S]*?\*\//gu, "")
          .matchAll(/([^{};]+)\{/gu),
      ].flatMap(([, list]) =>
        list.trim().startsWith("@")
          ? []
          : list
              .split(",")
              .flatMap((selector) =>
                isPrimitiveRule(selector)
                  ? [`${file}: ${selector.trim()}`]
                  : [],
              ),
      ),
    )

    expect(global).toEqual([])
  })

  // The shadcn CLI writes generated tokens into kit.css; move any it adds.
  it("defines semantic token values only in theme.css", () => {
    const semantic =
      /(?:^|[{;\s])--((?:sidebar-)?(?:background|foreground|card|popover|primary|secondary|muted|accent|destructive|border|input|ring)(?:-foreground)?|sidebar|chart-\d|radius)\s*:/gmu

    const defined = Object.entries(styles).flatMap(([file, css]) =>
      file.endsWith("/theme.css")
        ? []
        : [...css.matchAll(semantic)].map(([, name]) => `${file}: --${name}`),
    )

    expect(defined).toEqual([])
  })
})
