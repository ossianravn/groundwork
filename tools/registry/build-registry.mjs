// Generates registry.json, the shadcn registry for the Groundwork kit.
// Every kit file installs to the same path under src/kit/ in the consumer,
// so the kit's own imports stay valid. Item membership is in items.json;
// npm dependencies and item dependencies are read from each file's imports.
//
//   node tools/registry/build-registry.mjs              committed registry
//   node tools/registry/build-registry.mjs --ref <ref>  pin item deps to a ref
//   node tools/registry/build-registry.mjs --release    pin to v<package version>
//   node tools/registry/build-registry.mjs --local      deps as ./<name>.json
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")

const kit = "src/kit"

export const address = "ossianravn/groundwork"

// Item membership and copy live in items.json, so adding an item never
// grows this script:
//   groups           files that ship together; anything unlisted is its own
//                    item, named after the file (ui/button.tsx is "button")
//   descriptions     item descriptions; others get a generated one
//   peers            packages an item needs that its imports do not name
//   devDependencies  packages an item needs only at build time
const { groups, descriptions, peers, devDependencies } = JSON.parse(
  fs.readFileSync(path.join(root, "tools/registry/items.json"), "utf8"),
)

// Provided by any React + Tailwind project, or needed only at build time.
const provided = new Set(["react", "react-dom", "tailwindcss"])

function walk(dir) {
  return fs
    .readdirSync(path.join(root, dir), { withFileTypes: true })
    .flatMap((entry) => {
      const file = `${dir}/${entry.name}`

      if (entry.isDirectory()) return walk(file)

      return /\.(tsx?|css)$/u.test(entry.name) && !/\.test\./u.test(entry.name)
        ? [file]
        : []
    })
}

function matches(file, pattern) {
  if (pattern.endsWith("/")) return file.startsWith(pattern)

  if (pattern.startsWith("theme/*"))
    return (
      path.posix.dirname(file) === "theme" && file.endsWith(pattern.slice(7))
    )

  return file === pattern
}

function groupOf(file) {
  const group = Object.entries(groups).find(([, patterns]) =>
    patterns.some((pattern) => matches(file, pattern)),
  )

  return group?.[0] ?? path.posix.basename(file).replace(/\.(tsx?|css)$/u, "")
}

function specifiers(source, css) {
  // Statements only: a line that starts with import or export, so import-like
  // text inside strings (such as a generated @import) is not read as one.
  const pattern = css
    ? /^@import\s+"([^"]+)"/gmu
    : /^\s*(?:import|export)\s[^"]*?from\s+"([^"]+)"|^\s*import\s+"([^"]+)"/gmu

  return [...source.matchAll(pattern)].map(([, from, bare]) => from ?? bare)
}

function resolveInternal(from, specifier, files) {
  const base = specifier.startsWith("@/kit/")
    ? specifier.slice("@/kit/".length)
    : path.posix.join(path.posix.dirname(from), specifier)

  const found = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`].find(
    (candidate) => files.includes(candidate),
  )

  if (!found)
    throw new Error(`${from}: cannot resolve "${specifier}" inside the kit.`)

  return found
}

function packageName(specifier) {
  const parts = specifier.split("/")

  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]
}

function versioned(name, manifest) {
  const version =
    manifest.dependencies?.[name] ?? manifest.devDependencies?.[name]

  if (!version)
    throw new Error(`${name} is imported by the kit but not in package.json.`)

  return `${name}@${version}`
}

function title(name) {
  return name
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ")
}

function itemType(name, files) {
  if (name === "base" || name === "kit") return "registry:item"

  if (files.every((file) => file.startsWith("ui/"))) return "registry:ui"

  return files.length > 1 ? "registry:block" : "registry:component"
}

export function buildRegistry({ ref, local } = {}) {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(root, "package.json"), "utf8"),
  )

  const files = walk(kit)
    .map((file) => file.slice(kit.length + 1))
    .sort()

  const members = new Map()

  for (const file of files) {
    const group = groupOf(file)

    members.set(group, [...(members.get(group) ?? []), file])
  }

  const dependencyAddress = (name) =>
    local ? `./${name}.json` : `${address}/${name}${ref ? `#${ref}` : ""}`

  const items = [...members].map(([name, owned]) => {
    const packages = new Set(peers[name] ?? [])
    const stylesheetPackages = new Set()
    const needs = new Set(name === "base" ? [] : ["base"])

    for (const file of owned) {
      const source = fs.readFileSync(path.join(root, kit, file), "utf8")

      for (const specifier of specifiers(source, file.endsWith(".css"))) {
        if (specifier.startsWith("@/") && !specifier.startsWith("@/kit/"))
          throw new Error(`${file}: kit files may not import "${specifier}".`)

        if (specifier.startsWith("@/kit/") || specifier.startsWith(".")) {
          const target = groupOf(resolveInternal(file, specifier, files))

          if (target !== name) needs.add(target)
        } else if (!provided.has(packageName(specifier)))
          (file.endsWith(".css") ? stylesheetPackages : packages).add(
            packageName(specifier),
          )
      }
    }

    // Stylesheet imports compile at build time, so the host needs them only
    // as development dependencies (unless a script imports them too).
    const buildOnly = [
      ...(devDependencies[name] ?? []),
      ...[...stylesheetPackages].filter((dep) => !packages.has(dep)),
    ].sort()

    return {
      name,
      type: itemType(name, owned),
      title: title(name),
      description:
        descriptions[name] ??
        `${title(name)} ${owned[0].startsWith("ui/") ? "primitive" : "component"}, styled with Groundwork tokens.`,
      ...(packages.size && {
        dependencies: [...packages]
          .sort()
          .map((dep) => versioned(dep, manifest)),
      }),
      ...(buildOnly.length && {
        devDependencies: buildOnly.map((dep) => versioned(dep, manifest)),
      }),
      ...(needs.size && {
        registryDependencies: [...needs].sort().map(dependencyAddress),
      }),
      files: owned.map((file) => ({
        path: `${kit}/${file}`,
        type: "registry:file",
        target: `~/${kit}/${file}`,
      })),
    }
  })

  const order = (item) =>
    item.name === "base" ? 0 : item.type === "registry:ui" ? 1 : 2

  items.sort((a, b) => order(a) - order(b) || a.name.localeCompare(b.name))
  items.push({
    name: "kit",
    type: "registry:item",
    title: "Kit",
    description: descriptions.kit,
    registryDependencies: items.map((item) => dependencyAddress(item.name)),
    files: [],
  })

  return {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "groundwork",
    homepage: "https://github.com/ossianravn/groundwork",
    items,
  }
}

/** The tag a release commit pins its item dependencies to. */
export function releaseRef() {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(root, "package.json"), "utf8"),
  )

  return `v${manifest.version}`
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)

  const ref = args.includes("--release")
    ? releaseRef()
    : args.includes("--ref")
      ? args[args.indexOf("--ref") + 1]
      : undefined

  const registry = buildRegistry({ ref, local: args.includes("--local") })

  fs.writeFileSync(
    path.join(root, "registry.json"),
    `${JSON.stringify(registry, null, 2)}\n`,
  )
  console.log(`registry.json: ${registry.items.length} items`)
}
