import { ArrowLeft, ArrowUpRight } from "lucide-react"
import { buttonVariants } from "@/kit/ui/button"
import type {
  PublicLinkComponent,
  StoryLinkComponent,
} from "@/components/public-link"
import { projectColorStyle } from "@/components/project-color"
import { isProjectColor } from "@/demo/project-colors"
import customers from "@/demo/data/public-customers.json"
import type { CustomerStory } from "./story-card"
import { CustomerMark } from "./customer-mark"

// One customer story (MKT-19): outcome first, the figures, the team's own
// words, then what changed and a way into the same workspace.
export function CustomerStoryPage({
  story,
  LinkComponent,
  StoryLink,
}: {
  story: CustomerStory
  LinkComponent: PublicLinkComponent
  StoryLink: StoryLinkComponent
}) {
  const color = isProjectColor(story.color) ? story.color : "violet"
  const others = customers.stories.filter((item) => item.slug !== story.slug)

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="customer-story public-container"
      style={projectColorStyle(color)}
    >
      <LinkComponent destination="customers" className="customer-story-back">
        <ArrowLeft aria-hidden="true" />
        All stories
      </LinkComponent>
      <header className="customer-story-header">
        <p className="customer-story-company">
          <CustomerMark slug={story.slug} />
          {story.company}
          <span>
            {story.industry} · {story.size}
          </span>
        </p>
        <h1>{story.headline}</h1>
        <p className="customer-story-summary">{story.summary}</p>
        <p className="customer-story-note">{customers.note}</p>
      </header>
      <dl className="customer-story-metrics">
        {story.metrics.map((metric) => (
          <div key={metric.label}>
            <dt>{metric.label}</dt>
            <dd>{metric.value}</dd>
          </div>
        ))}
      </dl>
      <figure className="customer-story-quote">
        <blockquote>
          <p>“{story.quote.text}”</p>
        </blockquote>
        <figcaption>
          <span>{story.quote.person}</span>
          {story.quote.role}, {story.company}
        </figcaption>
      </figure>
      <div className="customer-story-body">
        {story.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </div>
      <aside className="customer-story-next" aria-label="Next steps">
        <LinkComponent
          destination="demo"
          className={buttonVariants({ size: "lg" })}
        >
          Try the sample workspace
          <ArrowUpRight aria-hidden="true" data-icon="inline-end" />
        </LinkComponent>
        <p>More stories:</p>
        <ul>
          {others.map((item) => (
            <li key={item.slug}>
              <StoryLink slug={item.slug}>{item.company}</StoryLink>
            </li>
          ))}
        </ul>
      </aside>
    </main>
  )
}
