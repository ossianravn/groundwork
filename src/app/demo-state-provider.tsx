import type { ReactNode } from "react"
import { useWorkspace } from "@/demo/use-workspace"
import { useAccess } from "@/demo/use-access"
import { useContact } from "@/demo/use-contact"
import { useTheme } from "@/kit/theme/use-theme"
import { usePresetLibrary } from "@/kit/theme/use-preset-library"
import { useResultsMemory } from "./use-results-memory"
import { useProjectDrafts } from "./use-project-drafts"
import { useProjectFiles } from "@/demo/use-project-files"
import { useAssistant } from "@/demo/assistant/use-assistant"
import { useAgentRuns } from "@/demo/use-agent-runs"
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
  const assistant = useAssistant()

  // A run's change lands in the project like the person's own edits.
  const runs = useAgentRuns((run) => {
    if (run.report) demo.postComment(run.projectId, run.report)

    if (run.tasks)
      demo.addTasks(
        run.projectId,
        run.tasks.map(({ title, assigneeId }) => ({ title, assigneeId })),
      )
  })

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
        assistant,
        runs,
      }}
    >
      {children}
    </DemoStateContext>
  )
}
