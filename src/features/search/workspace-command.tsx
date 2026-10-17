import { useState } from "react"
import { CircleCheck, Circle, Search } from "lucide-react"
import { TopbarSearch } from "@/kit/shell/topbar-search"
import { CommandGroup, CommandItem, CommandShortcut } from "@/kit/ui/command"
import { MemberAvatar } from "@/kit/member-avatar"
import { ProjectMark } from "@/components/project-identity"
import {
  commandResults,
  type CommandEntry,
  type CommandSources,
  type CommandTask,
} from "./command-results"

export type { CommandEntry, CommandTask } from "./command-results"

// The shortcut hint follows the visitor's platform.
const modifierKey =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.userAgent)
    ? "⌘"
    : "Ctrl"

/**
 * The top bar's command menu (SYS-02): before typing, recent projects,
 * actions and pages; once typing, Search everything first (SYS-10), then
 * the matches `commandResults` finds.
 */
export function WorkspaceCommand({
  open,
  onOpenChange,
  onSelectProject,
  onSelectTask,
  onSelectPerson,
  onPage,
  onAction,
  onSearchAll,
  ...sources
}: CommandSources & {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectProject: (id: string) => void
  onSelectTask: (task: CommandTask) => void
  onSelectPerson: (id: string) => void
  onPage: (id: string) => void
  onAction: (id: string) => void
  onSearchAll: (query: string) => void
}) {
  const [query, setQuery] = useState("")
  const results = commandResults(query, sources)

  function close() {
    setQuery("")
    onOpenChange(false)
  }

  function run(action: () => void) {
    close()
    action()
  }

  const entryGroup = (
    heading: string,
    list: CommandEntry[],
    onSelect: (id: string) => void,
  ) =>
    list.length > 0 && (
      <CommandGroup heading={heading}>
        {list.map((entry) => (
          <CommandItem
            key={entry.id}
            value={`${heading}:${entry.id}`}
            onSelect={() => run(() => onSelect(entry.id))}
          >
            <entry.icon aria-hidden="true" />
            {entry.label}
          </CommandItem>
        ))}
      </CommandGroup>
    )

  return (
    <TopbarSearch
      label="Search"
      placeholder="Search or jump to…"
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
      query={query}
      onQueryChange={setQuery}
      hint={[modifierKey, "K"]}
      keyShortcuts="Control+k Meta+k"
      shouldFilter={false}
    >
      {results.typed && (
        <CommandGroup heading="Search">
          <CommandItem
            value="search-all"
            onSelect={() => run(() => onSearchAll(query.trim()))}
          >
            <Search aria-hidden="true" />
            Search everything for “{query.trim()}”
          </CommandItem>
        </CommandGroup>
      )}
      {results.projects.length > 0 && (
        <CommandGroup heading={results.projectsHeading}>
          {results.projects.map((project) => (
            <CommandItem
              key={project.id}
              value={`project:${project.id}`}
              onSelect={() => run(() => onSelectProject(project.id))}
            >
              <span className="command-mark" aria-hidden="true">
                <ProjectMark color={project.color} />
              </span>
              {project.name}
            </CommandItem>
          ))}
        </CommandGroup>
      )}
      {entryGroup("Actions", results.actions, onAction)}
      {entryGroup("Pages", results.pages, onPage)}
      {results.tasks.length > 0 && (
        <CommandGroup heading="Tasks">
          {results.tasks.map((task) => (
            <CommandItem
              key={task.id}
              value={`task:${task.id}`}
              onSelect={() => run(() => onSelectTask(task))}
            >
              {task.done ? (
                <CircleCheck aria-hidden="true" />
              ) : (
                <Circle aria-hidden="true" />
              )}
              <span className="command-label">{task.title}</span>
              {/* The shortcut slot ends the row; here it names the project. */}
              <CommandShortcut className="command-detail">
                {task.projectName}
              </CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
      {results.people.length > 0 && (
        <CommandGroup heading="People">
          {results.people.map((person) => (
            <CommandItem
              key={person.id}
              value={`person:${person.id}`}
              onSelect={() => run(() => onSelectPerson(person.id))}
            >
              <MemberAvatar member={person} size="sm" />
              {person.name}
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </TopbarSearch>
  )
}
