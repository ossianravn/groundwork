import content from "@/demo/data/content.json"

export interface ContentSection {
  id: string
  title: string
  paragraphs: string[]
  steps?: string[]
  bullets?: string[]
}

export interface Guide {
  slug: string
  title: string
  summary: string
  topic: string
  date: string
  sections: ContentSection[]
  related: string[]
}

export interface Article extends Guide {
  image: string
  alt: string
  caption: string
}

export interface Release {
  version: string
  date: string
  title: string
  summary: string
  sections: ContentSection[]
  guide: string
}

export const articles: Article[] = content.articles

export const guides: Guide[] = content.guides

export const releases: Release[] = content.releases

export const questions = content.questions

export function searchGuides(query: string): Guide[] {
  const terms = query
    .trim()
    .toLocaleLowerCase("en")
    .split(/\s+/)
    .filter(Boolean)

  return guides.filter((guide) => {
    const text = [
      guide.title,
      guide.summary,
      guide.topic,
      ...guide.sections.flatMap((section) => [
        section.title,
        ...section.paragraphs,
        ...(section.steps ?? []),
        ...(section.bullets ?? []),
      ]),
    ]
      .join(" ")
      .toLocaleLowerCase("en")

    return terms.every((term) => text.includes(term))
  })
}

export function contentDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`))
}
