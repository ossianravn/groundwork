import { createContext, useContext } from "react"
import type { useWorkspace } from "@/demo/use-workspace"
import type { useResultsMemory } from "./use-results-memory"
import type { useProjectDrafts } from "./use-project-drafts"
import type { useTheme } from "@/kit/theme/use-theme"

interface WorkspaceContextValue {
  appearance: ReturnType<typeof useTheme>
  demo: ReturnType<typeof useWorkspace>
  onNewProject: () => void
  onSelectProject: (id: string) => void
  rememberProjectOpener: () => void
  onOpenDetail: (returnTo: string) => void
  results: ReturnType<typeof useResultsMemory>
  drafts: ReturnType<typeof useProjectDrafts>
}

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(
  null,
)

export function useDemoWorkspace() {
  const value = useContext(WorkspaceContext)

  if (!value) throw new Error("Workspace views require the workspace host")

  return value
}
