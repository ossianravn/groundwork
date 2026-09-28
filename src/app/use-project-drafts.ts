import { useState } from "react"
import type { ProjectDraft } from "@/demo/project-draft"

export function useProjectDrafts() {
  const [entries, setEntries] = useState<Partial<Record<string, ProjectDraft>>>(
    {},
  )

  function update(key: string, draft: ProjectDraft) {
    setEntries((current) => ({ ...current, [key]: draft }))
  }

  function discard(key: string) {
    setEntries((current) => {
      const next = { ...current }
      delete next[key]

      return next
    })
  }

  return { entries, update, discard, reset: () => setEntries({}) }
}
