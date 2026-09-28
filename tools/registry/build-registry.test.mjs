import fs from "node:fs"
import { describe, expect, it } from "vitest"
import { registrySchema } from "shadcn/schema"
import { address, buildRegistry, releaseRef } from "./build-registry.mjs"

const committed = JSON.parse(fs.readFileSync("registry.json", "utf8"))

const dependencies = committed.items.flatMap(
  (item) => item.registryDependencies ?? [],
)

// Main addresses items on the default branch; a release commit (see
// release.mjs) pins every one to its own tag. Anything else is a mistake.
const pinned = dependencies.some((dependency) => dependency.includes("#"))

const ref = pinned ? releaseRef() : undefined

describe("kit registry", () => {
  it("is up to date with the kit (run npm run registry)", () => {
    expect(committed).toEqual(buildRegistry({ ref }))
  })

  it("is a valid shadcn registry", () => {
    const result = registrySchema.safeParse(committed)

    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true)
  })

  it("ships every kit file exactly once, to the same path", () => {
    const files = committed.items.flatMap((item) => item.files)
    const paths = files.map((file) => file.path)

    expect(new Set(paths).size).toBe(paths.length)

    for (const file of files) expect(file.target).toBe(`~/${file.path}`)
  })

  // Bare names would resolve to shadcn's own items, and other refs or local
  // paths are for testing only.
  it("addresses its own items, unpinned or pinned to this release", () => {
    const suffix = ref ? `#${ref.replaceAll(".", "\\.")}` : ""
    const pattern = new RegExp(`^${address}/[a-z-]+${suffix}$`, "u")

    for (const dependency of dependencies) expect(dependency).toMatch(pattern)
  })
})
