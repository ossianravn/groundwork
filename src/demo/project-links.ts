import type { ProjectLink } from "./model"

export function projectLinkError(link: ProjectLink) {
  if (!link.url.trim() && !link.label.trim()) return

  try {
    const url = new URL(link.url.trim())

    if (url.protocol === "https:" || url.protocol === "http:") return
  } catch {
    return "Enter a complete HTTP or HTTPS URL."
  }

  return "Enter a complete HTTP or HTTPS URL."
}

export function savedProjectLinks(links: ProjectLink[]) {
  return links.flatMap((link) =>
    link.url.trim() || link.label.trim()
      ? [{ ...link, label: link.label.trim(), url: link.url.trim() }]
      : [],
  )
}

export function sameProjectLinks(a: ProjectLink[], b: ProjectLink[]) {
  const values = (links: ProjectLink[]) =>
    savedProjectLinks(links).map(({ label, url }) => ({ label, url }))

  return JSON.stringify(values(a)) === JSON.stringify(values(b))
}
