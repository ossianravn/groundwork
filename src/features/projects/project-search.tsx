import { useState, type ComponentProps } from "react"
import { FolderKanban, Search, X } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { DialogClose } from "@/kit/ui/dialog"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/kit/ui/command"
import type { Project } from "@/demo/model"

export function ProjectSearch({
  open,
  onOpenChange,
  projects,
  onSelect,
  onSearchAll,
  finalFocus,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects: Project[]
  onSelect: (id: string) => void
  /** Opens full results; offered first once something is typed (SYS-10). */
  onSearchAll?: (query: string) => void
  finalFocus?: ComponentProps<typeof CommandDialog>["finalFocus"]
}) {
  const [query, setQuery] = useState("")

  return (
    <CommandDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setQuery("")
        onOpenChange(next)
      }}
      finalFocus={finalFocus}
      title="Find a project"
      description="Search this workspace's projects."
    >
      <Command>
        <CommandInput
          placeholder="Find a project…"
          aria-label="Find a project"
          value={query}
          onValueChange={setQuery}
          trailingAction={
            <DialogClose render={<Button variant="ghost" size="icon" />}>
              <X aria-hidden="true" />
              <span className="sr-only">Close</span>
            </DialogClose>
          }
        />
        <CommandList>
          <CommandEmpty>No matching projects.</CommandEmpty>
          {onSearchAll && query.trim() && (
            <CommandGroup heading="Search">
              <CommandItem
                value={`search-all ${query}`}
                forceMount
                onSelect={() => {
                  onOpenChange(false)
                  onSearchAll(query.trim())
                  setQuery("")
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
                  onOpenChange(false)
                  onSelect(project.id)
                }}
              >
                <FolderKanban aria-hidden="true" />
                {project.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
