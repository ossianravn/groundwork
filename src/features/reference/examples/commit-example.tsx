import { Commit } from "@/kit/ui/commit"

export function CommitExample() {
  return (
    <Commit
      className="max-w-xl"
      hash="9b41c7e02d5f8a3b6c1e4d7f0a2b5c8e1f4a7d0b"
      message="Add a terminal and file tree to the kit"
      body="Terminal output keeps its ANSI colours as theme roles, and the file tree follows the tree keyboard pattern."
      author="Ossian"
      date="30 Sep 2026, 11:05"
      files={[
        { path: "src/kit/ui/terminal.tsx", additions: 108, deletions: 0 },
        { path: "src/kit/ui/file-tree.tsx", additions: 209, deletions: 0 },
        {
          path: "tools/registry/build-registry.mjs",
          additions: 2,
          deletions: 1,
        },
      ]}
    />
  )
}
