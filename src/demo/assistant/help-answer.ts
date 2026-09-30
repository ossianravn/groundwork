import content from "../data/content.json"
import type { AssistantReply } from "./assistant-types"

/** The help guide a prompt names by its title, as "Open in chat" asks. */
export function namedGuide(prompt: string) {
  const text = prompt.toLowerCase()

  return content.guides.find((guide) =>
    text.includes(guide.title.toLowerCase()),
  )
}

/** A short orientation to a help guide, citing it as the source. */
export function helpAnswer(
  guide: NonNullable<ReturnType<typeof namedGuide>>,
): Omit<AssistantReply, "followUps"> {
  const path = `/help/${guide.slug}`

  return {
    text: [
      `**${guide.title}**: ${guide.summary}[1](#source:${guide.slug})`,
      "It covers:",
      guide.sections.map((section) => `- ${section.title}`).join("\n"),
      `Read the full guide in the [help centre](${path}).`,
    ].join("\n\n"),
    sources: [
      {
        id: guide.slug,
        url: path,
        title: guide.title,
        description: `Help · ${guide.topic}`,
      },
    ],
  }
}
