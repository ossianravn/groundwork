import fileData from "./data/files.json"
import type { ProjectFile } from "./model"

export const initialFiles: ProjectFile[] = fileData

/** Uploads above this size are refused before they start. */
export const maxFileSize = 10 * 1024 * 1024

export function fileError(file: { size: number }) {
  return file.size > maxFileSize
    ? `Larger than ${formatBytes(maxFileSize)}. Choose a smaller file.`
    : ""
}

export function isImageFile(file: { type: string }) {
  return file.type.startsWith("image/")
}

export function formatBytes(size: number) {
  if (size < 1024) return `${size} B`

  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`

  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

/** Put a removed file back at its earlier position. */
export function restoreFile(
  files: ProjectFile[],
  file: ProjectFile,
  index: number,
) {
  if (files.some((item) => item.id === file.id)) return files

  const at = Math.min(index, files.length)

  return [...files.slice(0, at), file, ...files.slice(at)]
}
