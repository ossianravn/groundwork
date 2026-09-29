import { useState } from "react"
import type { ProjectFile } from "./model"
import { initialFiles, restoreFile } from "./project-files"

/**
 * Attachments live in memory like the rest of the demo. Uploaded files use
 * object URLs, which stop working after a reload; reset returns to fixtures.
 */
export function useProjectFiles() {
  const [files, setFiles] = useState(initialFiles)

  return {
    files,
    add(file: ProjectFile) {
      setFiles((current) => [file, ...current])
    },
    /** Removes a file and returns a function that puts it back. */
    remove(id: string) {
      const index = files.findIndex((file) => file.id === id)
      const file = files[index]

      if (!file) return undefined

      setFiles((current) => current.filter((item) => item.id !== id))

      return () => setFiles((current) => restoreFile(current, file, index))
    },
    reset() {
      setFiles(initialFiles)
    },
    clear() {
      setFiles([])
    },
  }
}
