import { useState } from "react"
import { FileTree, type FileNode } from "@/kit/ui/file-tree"

const nodes: FileNode[] = [
  {
    name: "src",
    path: "src",
    children: [
      {
        name: "kit",
        path: "src/kit",
        children: [
          {
            name: "terminal.tsx",
            path: "src/kit/terminal.tsx",
            status: "added",
          },
          {
            name: "file-tree.tsx",
            path: "src/kit/file-tree.tsx",
            status: "added",
          },
          { name: "button.tsx", path: "src/kit/button.tsx" },
        ],
      },
      { name: "main.tsx", path: "src/main.tsx", status: "modified" },
      { name: "legacy.ts", path: "src/legacy.ts", status: "deleted" },
    ],
  },
  { name: "package.json", path: "package.json", status: "modified" },
  { name: "README.md", path: "README.md" },
]

export function FileTreeExample() {
  const [selected, setSelected] = useState("src/main.tsx")

  return (
    <div className="grid max-w-xs gap-2">
      <FileTree
        nodes={nodes}
        label="Changed files"
        selected={selected}
        onSelect={setSelected}
        defaultExpanded={["src", "src/kit"]}
      />
      <p className="text-sm text-muted-foreground">Selected: {selected}</p>
    </div>
  )
}
