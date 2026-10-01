/** Saves markdown as a file through a temporary link. */
export function downloadMarkdown(name: string, content: string) {
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/markdown" }),
  )

  const link = document.createElement("a")

  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}
