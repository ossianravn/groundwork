import type { ReactNode } from "react"
import { useWorkspace } from "@/demo/use-workspace"
import { useAccess } from "@/demo/use-access"
import { useContact } from "@/demo/use-contact"
import { useTheme } from "@/kit/theme/use-theme"
import { usePresetLibrary } from "@/kit/theme/use-preset-library"
import { useResultsMemory } from "./use-results-memory"
import { useProjectDrafts } from "./use-project-drafts"
import { useProjectFiles } from "@/demo/use-project-files"
import { DemoStateContext } from "./demo-state"

export function DemoStateProvider({ children }: { children: ReactNode }) {
  const demo = useWorkspace()
  const access = useAccess()
  const contact = useContact()
  const appearance = useTheme()
  const presetLibrary = usePresetLibrary()
  const results = useResultsMemory()
  const drafts = useProjectDrafts()
  const files = useProjectFiles()

  return (
    <DemoStateContext
      value={{
        demo,
        access,
        contact,
        appearance,
        presetLibrary,
        results,
        drafts,
        files,
      }}
    >
      {children}
    </DemoStateContext>
  )
}
