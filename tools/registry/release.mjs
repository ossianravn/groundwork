// Cuts a registry release: `npm run release -- <version> [--trailer "<text>"]`.
//
// shadcn does not pass an item's #ref on to its registryDependencies, so
// `kit#v1.2.0` would otherwise pull every part from main. A release commit
// therefore pins every dependency to its own tag; the next commit unpins
// main again. Push afterwards with: git push <remote> main v<version>
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { buildRegistry, releaseRef } from "./build-registry.mjs"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")

const args = process.argv.slice(2)

const version = args[0]

const trailer = args.includes("--trailer")
  ? ["--trailer", args[args.indexOf("--trailer") + 1]]
  : []

function git(...command) {
  return execFileSync("git", command, { cwd: root, encoding: "utf8" }).trim()
}

function writeRegistry(options) {
  fs.writeFileSync(
    path.join(root, "registry.json"),
    `${JSON.stringify(buildRegistry(options), null, 2)}\n`,
  )
}

function commit(message) {
  git("add", "package.json", "registry.json")
  git("commit", "-m", message, ...trailer)
}

if (!/^\d+\.\d+\.\d+$/u.test(version ?? ""))
  throw new Error("Give the version to release, such as 0.2.0.")

if (git("status", "--porcelain", "--untracked-files=no"))
  throw new Error("Commit or stash your changes before releasing.")

if (git("tag", "--list", `v${version}`))
  throw new Error(`v${version} already exists.`)

const manifestPath = path.join(root, "package.json")

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"))

manifest.version = version

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

const ref = releaseRef()

writeRegistry({ ref })

commit(`Release ${ref}\n\nPins the registry's item dependencies to ${ref}.`)

git("tag", "-a", ref, "-m", `Groundwork ${ref}`)

writeRegistry({})

commit(`Unpin the registry after ${ref}`)

console.log(`Released ${ref}. Push with: git push <remote> main ${ref}`)
