import { createContext, useContext } from "react"
import type { useWorkspace } from "@/demo/use-workspace"
import type { useAccess } from "@/demo/use-access"
import type { useContact } from "@/demo/use-contact"
import type { useTheme } from "@/kit/theme/use-theme"
import type { usePresetLibrary } from "@/kit/theme/use-preset-library"
import type { useResultsMemory } from "./use-results-memory"
import type { useProjectDrafts } from "./use-project-drafts"
import type { useProjectFiles } from "@/demo/use-project-files"

export const DemoStateContext = createContext<{
  demo: ReturnType<typeof useWorkspace>
  access: ReturnType<typeof useAccess>
  contact: ReturnType<typeof useContact>
  appearance: ReturnType<typeof useTheme>
  presetLibrary: ReturnType<typeof usePresetLibrary>
  results: ReturnType<typeof useResultsMemory>
  drafts: ReturnType<typeof useProjectDrafts>
  files: ReturnType<typeof useProjectFiles>
} | null>(null)

export function useDemoState() {
  const state = useContext(DemoStateContext)

  if (!state) throw new Error("Demo state requires DemoStateProvider")

  return state
}
