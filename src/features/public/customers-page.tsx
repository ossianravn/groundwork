import type {
  PublicLinkComponent,
  StoryLinkComponent,
} from "@/components/public-link"
import customers from "@/demo/data/public-customers.json"
import { CustomerLogos } from "./customer-logos"
import { StoryCard } from "./story-card"
import { TestimonialWall } from "./testimonial-wall"

export function CustomersPage({
  StoryLink,
}: {
  LinkComponent: PublicLinkComponent
  StoryLink: StoryLinkComponent
}) {
  return (
    <main id="main-content" tabIndex={-1} className="customers-page">
      <header className="public-page-heading public-container">
        <h1>Teams that plan in Tandem.</h1>
        <p>
          Four sample stories and a few quotes, told with the features in the
          demo. The teams, people and figures are fictional.
        </p>
      </header>
      <div className="public-container">
        <CustomerLogos motion="marquee" />
      </div>
      <section
        className="customer-story-grid public-container"
        aria-label="Stories"
      >
        {customers.stories.map((story) => (
          <StoryCard key={story.slug} story={story} StoryLink={StoryLink} />
        ))}
      </section>
      <TestimonialWall />
    </main>
  )
}
