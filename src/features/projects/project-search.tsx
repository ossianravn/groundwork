import type { ComponentProps } from "react"
import { FolderKanban, X } from "lucide-react"
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
  finalFocus,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects: Project[]
  onSelect: (id: string) => void
  finalFocus?: ComponentProps<typeof CommandDialog>["finalFocus"]
}) {
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      finalFocus={finalFocus}
      title="Find a project"
      description="Search this workspace's projects."
    >
      <Command>
        <CommandInput
          placeholder="Find a project…"
          aria-label="Find a project"
          trailingAction={
            <DialogClose render={<Button variant="ghost" size="icon" />}>
              <X aria-hidden="true" />
              <span className="sr-only">Close</span>
            </DialogClose>
          }
        />
        <CommandList>
          <CommandEmpty>No matching projects.</CommandEmpty>
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
