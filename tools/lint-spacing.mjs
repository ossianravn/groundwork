import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

// Layout spacing comes from role tokens (docs/design-system.md, Spacing).
// This check finds raw spacing in feature code and the demo stylesheets:
// Tailwind spacing numbers in class names, literal lengths in CSS spacing
// declarations, and deprecated token names. Kit primitives own their
// internals and are not checked. Findings that existed before a file was
// migrated are recorded in tools/spacing-baseline.json: a file may not gain
// findings, and `--update` records the lower count after a migration.

const root = resolve(fileURLToPath(new URL("..", import.meta.url)))

const baselinePath = join(root, "tools/spacing-baseline.json")

const roots = ["src/features", "src/app", "src/components", "src/styles"]

// gap-3, px-4, -mt-1, sm:gap-y-2.5, p-[13px]; zero and token forms pass.
const utility =
  /(?<![\w-])(?:[a-z0-9-]+:)*-?(?:gap(?:-[xy])?|space-[xy]|[pm][xytrblse]?)-(\d+(?:\.\d+)?|px|\[[^\]\s]+\])(?![\w-])/gu

const declaration =
  /(?<![\w-])(gap|row-gap|column-gap|(?:margin|padding)(?:-(?:top|bottom|left|right|inline|block)(?:-(?:start|end))?)?)\s*:\s*([^;}]+)/gu

/** Token names that role tokens replaced (aliases in theme.css). */
export const deprecatedTokens = [
  "--control-gap",
  "--content-gap",
  "--stack-gap",
  "--section-gap",
  "--item-padding",
  "--card-padding",
  "--panel-padding",
  "--page-padding",
  "--row-padding",
]

/** Raw spacing in a class-bearing source file, with line numbers. */
export function classFindings(source) {
  return [...source.matchAll(utility)].flatMap((match) =>
    match[1] === "0"
      ? []
      : [{ index: match.index, text: match[0].replace(/^\s+/u, "") }],
  )
}

/** Literal lengths of 3px or more in CSS spacing declarations. */
export function cssFindings(source) {
  return [...source.matchAll(declaration)].flatMap((match) => {
    const value = match[2].replace(/var\([^()]*(?:\([^()]*\)[^()]*)*\)/gu, "")

    const literal = [...value.matchAll(/(-?\d*\.?\d+)(rem|em|px)\b/gu)].some(
      ([, number, unit]) =>
        Math.abs(Number(number) * (unit === "px" ? 1 : 16)) >= 3,
    )

    return literal ? [{ index: match.index, text: match[0].trim() }] : []
  })
}

/** Uses of retired token names. */
export function tokenFindings(source, tokens = deprecatedTokens) {
  return tokens.flatMap((token) =>
    [...source.matchAll(new RegExp(`${token}(?![\\w-])`, "gu"))].map(
      (match) => ({ index: match.index, text: token }),
    ),
  )
}

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)

    if (entry.isDirectory()) return files(path)

    return /\.(tsx|ts|css)$/u.test(entry.name) &&
      !/\.test\.tsx?$/u.test(entry.name)
      ? [path]
      : []
  })
}

const line = (source, index) => source.slice(0, index).split("\n").length

function findingsOf(path) {
  const source = readFileSync(path, "utf8")

  const found = [
    ...(path.endsWith(".css") ? cssFindings(source) : classFindings(source)),
    ...tokenFindings(source),
  ]

  return found.map((item) => ({ ...item, line: line(source, item.index) }))
}

function run() {
  const update = process.argv.includes("--update")

  const baseline = update
    ? {}
    : JSON.parse(readFileSync(baselinePath, "utf8") || "{}")

  const counts = {}
  const over = []

  for (const path of roots.flatMap((dir) => files(join(root, dir)))) {
    const name = relative(root, path).replaceAll("\\", "/")
    const found = findingsOf(path)

    if (!found.length) continue

    counts[name] = found.length

    if (!update && found.length > (baseline[name] ?? 0))
      over.push({ name, found, allowed: baseline[name] ?? 0 })
  }

  const total = Object.values(counts).reduce((sum, n) => sum + n, 0)

  if (update) {
    const sorted = Object.fromEntries(Object.entries(counts).sort())

    writeFileSync(baselinePath, `${JSON.stringify(sorted, null, 2)}\n`)
    console.log(
      `spacing: baseline recorded, ${total} findings in ${Object.keys(counts).length} files.`,
    )

    return
  }

  for (const { name, found, allowed } of over) {
    console.log(
      `${name}: ${found.length} raw spacing values (baseline ${allowed})`,
    )

    for (const item of found)
      console.log(`  ${name}:${item.line}  ${item.text}`)
  }

  const recorded = Object.values(baseline).reduce((sum, n) => sum + n, 0)

  console.log(
    over.length
      ? `spacing: ${over.length} files gained raw spacing; use role tokens (docs/design-system.md).`
      : `spacing: ${total} findings, baseline ${recorded}${total < recorded ? "; run with --update to record the lower count" : ""}.`,
  )

  process.exitCode = over.length ? 1 : 0
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  run()
