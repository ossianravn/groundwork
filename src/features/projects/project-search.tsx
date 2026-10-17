import { useState } from "react"
import { FolderKanban, Search } from "lucide-react"
import { TopbarSearch } from "@/kit/shell/topbar-search"
import { CommandEmpty, CommandGroup, CommandItem } from "@/kit/ui/command"
import type { Project } from "@/demo/model"

// The shortcut hint follows the visitor's platform.
const modifierKey =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.userAgent)
    ? "⌘"
    : "Ctrl"

export function ProjectSearch({
  open,
  onOpenChange,
  projects,
  onSelect,
  onSearchAll,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects: Project[]
  onSelect: (id: string) => void
  /** Opens full results; offered first once something is typed (SYS-10). */
  onSearchAll?: (query: string) => void
}) {
  const [query, setQuery] = useState("")

  function close() {
    setQuery("")
    onOpenChange(false)
  }

  return (
    <TopbarSearch
      label="Search"
      placeholder="Find a project…"
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
      query={query}
      onQueryChange={setQuery}
      hint={[modifierKey, "K"]}
      keyShortcuts="Control+k Meta+k"
    >
      <CommandEmpty>No matching projects.</CommandEmpty>
      {onSearchAll && query.trim() && (
        <CommandGroup heading="Search">
          <CommandItem
            value={`search-all ${query}`}
            forceMount
            onSelect={() => {
              close()
              onSearchAll(query.trim())
            }}
          >
            <Search aria-hidden="true" />
            Search everything for “{query.trim()}”
          </CommandItem>
        </CommandGroup>
      )}
      <CommandGroup heading="Projects">
        {projects.map((project) => (
          <CommandItem
            key={project.id}
            value={project.id}
            keywords={[project.name]}
            onSelect={() => {
              close()
              onSelect(project.id)
            }}
          >
            <FolderKanban aria-hidden="true" />
            {project.name}
          </CommandItem>
        ))}
      </CommandGroup>
    </TopbarSearch>
  )
}
