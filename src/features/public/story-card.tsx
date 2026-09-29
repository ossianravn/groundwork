import { ArrowUpRight } from "lucide-react"
import type { StoryLinkComponent } from "@/components/public-link"
import { projectColorStyle } from "@/components/project-color"
import { isProjectColor } from "@/demo/project-colors"
import customers from "@/demo/data/public-customers.json"
import { CustomerMark } from "./customer-mark"

export type CustomerStory = (typeof customers.stories)[number]

/** A story preview: the team on its colour, the outcome and one figure. */
export function StoryCard({
  story,
  StoryLink,
}: {
  story: CustomerStory
  StoryLink: StoryLinkComponent
}) {
  const color = isProjectColor(story.color) ? story.color : "violet"
  const [metric] = story.metrics

  return (
    <article className="story-card" style={projectColorStyle(color)}>
      <div className="story-card-tile">
        <CustomerMark slug={story.slug} className="story-card-mark" />
        <span>{story.company}</span>
      </div>
      <p className="story-card-meta">
        {story.industry} · {story.size}
      </p>
      <h3>{story.headline}</h3>
      <p className="story-card-metric">
        <strong>{metric.value}</strong> {metric.label}
      </p>
      <StoryLink slug={story.slug} className="story-card-link">
        Read the story
        <span className="sr-only"> about {story.company}</span>
        <ArrowUpRight aria-hidden="true" />
      </StoryLink>
    </article>
  )
}
