import { useNavigate } from "@tanstack/react-router"
import { Keyboard, Plus, Settings, Upload, UserPlus } from "lucide-react"
import { WorkspaceCommand } from "@/features/search/workspace-command"
import { useDemoWorkspace } from "./workspace-context"
import { workspacePages } from "./workspace-pages"

const actions = [
  { id: "new", label: "New project", icon: Plus, keywords: "create add" },
  { id: "import", label: "Import projects", icon: Upload, keywords: "csv" },
  {
    id: "invite",
    label: "Invite a teammate",
    icon: UserPlus,
    keywords: "team member",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    keywords: "profile preferences",
  },
  {
    id: "shortcuts",
    label: "Keyboard shortcuts",
    icon: Keyboard,
    keywords: "keys help",
  },
] as const

/** The command menu with Tandem's records, routes and actions. */
export function WorkspaceCommandHost({
  open,
  onOpenChange,
  recentProjectIds,
  onOpenProject,
  onShortcuts,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  recentProjectIds: string[]
  /** Opens a project's quick view from the menu. */
  onOpenProject: (id: string) => void
  onShortcuts: () => void
}) {
  const { demo, onNewProject } = useDemoWorkspace()
  const navigate = useNavigate()

  const projectName = (id: string) =>
    demo.projects.find((project) => project.id === id)?.name ?? ""

  return (
    <WorkspaceCommand
      open={open}
      onOpenChange={onOpenChange}
      projects={demo.projects}
      recentProjectIds={recentProjectIds}
      tasks={demo.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        done: task.done,
        projectId: task.projectId,
        projectName: projectName(task.projectId),
      }))}
      people={demo.workspace.people}
      pages={workspacePages}
      actions={actions}
      onSelectProject={onOpenProject}
      onSelectTask={(task) => onOpenProject(task.projectId)}
      onSelectPerson={() => void navigate({ to: "/app/demo/settings/team" })}
      onPage={(id) => {
        const page = workspacePages.find((item) => item.id === id)

        if (page) void navigate({ to: page.to, search: page.search })
      }}
      onAction={(id) => {
        if (id === "new") onNewProject()
        else if (id === "import")
          void navigate({ to: "/app/demo/projects/import" })
        else if (id === "invite")
          void navigate({ to: "/app/demo/settings/team" })
        else if (id === "settings")
          void navigate({ to: "/app/demo/settings/profile" })
        else onShortcuts()
      }}
      onSearchAll={(q) =>
        void navigate({ to: "/app/demo/search", search: { q, type: "" } })
      }
    />
  )
}
