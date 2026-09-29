import { ArrowRight, ArrowUpRight } from "lucide-react"
import { buttonVariants } from "@/kit/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/kit/ui/accordion"
import type {
  PublicDestination,
  PublicLinkComponent,
  StoryLinkComponent,
} from "@/components/public-link"
import content from "@/demo/data/public-home.json"
import type { ProjectColor } from "@/demo/model"
import { projectColorStyle } from "@/components/project-color"
import { Newsletter } from "./newsletter"
import { CustomerLogos } from "./customer-logos"
import { StatsBand } from "./stats-band"
import { CustomerStories } from "./customer-stories"

// Each feature shows a close-up of the real screen it describes, on a tile
// tinted with a project colour.
const features: {
  shot: "overview" | "board" | "project"
  color: ProjectColor
  destination: PublicDestination
}[] = [
  { shot: "overview", color: "violet", destination: "demo" },
  { shot: "board", color: "amber", destination: "board" },
  { shot: "project", color: "teal", destination: "projects" },
]

export function HomePage({
  LinkComponent,
  StoryLink,
}: {
  LinkComponent: PublicLinkComponent
  StoryLink: StoryLinkComponent
}) {
  return (
    <main id="main-content" tabIndex={-1}>
      <section
        className="public-hero public-container"
        aria-labelledby="home-title"
      >
        <div className="public-hero-copy">
          <h1 id="home-title">
            {content.title.split(/(?<=\.)\s+/u).map((sentence) => (
              <span key={sentence}>{sentence}</span>
            ))}
          </h1>
          <p>{content.description}</p>
          <div className="public-hero-actions">
            <LinkComponent
              destination="demo"
              className={buttonVariants({ size: "lg" })}
            >
              Open demo{" "}
              <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
            </LinkComponent>
            <LinkComponent
              destination="features"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Explore features{" "}
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </LinkComponent>
          </div>
          <p className="public-note">
            Explore a sample workspace. No sign-up needed.
          </p>
        </div>
        <figure className="public-product-preview">
          <span className="public-stage" aria-hidden="true" />
          <LinkComponent
            destination="demo"
            aria-label="Open the workspace shown in the preview"
          >
            <img
              src="/images/tandem-overview.png"
              width={1280}
              height={860}
              fetchPriority="high"
              alt="Tandem overview with project totals, completed tasks, and recent team activity."
            />
          </LinkComponent>
          <figcaption>Studio North · Sample workspace</figcaption>
        </figure>
      </section>
      <div className="public-container">
        <CustomerLogos />
      </div>
      <section
        id="features"
        tabIndex={-1}
        className="public-features public-container"
        aria-labelledby="features-title"
      >
        <div className="public-section-heading">
          <h2 id="features-title">
            The big picture.
            <br />
            And the next step.
          </h2>
          <p>
            Move between a workspace overview and the details that make each
            project happen.
          </p>
        </div>
        <div className="public-feature-grid">
          {content.features.map((feature, index) => {
            const { shot, color, destination } = features[index]

            return (
              <article key={feature.title}>
                <span
                  className="public-feature-shot"
                  data-shot={shot}
                  style={projectColorStyle(color)}
                  aria-hidden="true"
                >
                  <span />
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <LinkComponent destination={destination}>
                  {feature.linkLabel}
                  <ArrowUpRight aria-hidden="true" />
                </LinkComponent>
              </article>
            )
          })}
        </div>
      </section>
      <StatsBand LinkComponent={LinkComponent} />
      <CustomerStories LinkComponent={LinkComponent} StoryLink={StoryLink} />
      <section
        id="questions"
        tabIndex={-1}
        className="public-questions public-container"
        aria-labelledby="questions-title"
      >
        <div className="public-section-heading">
          <h2 id="questions-title">
            A few things
            <br />
            to know.
          </h2>
          <p>Start with the demo. Make it your own.</p>
        </div>
        <Accordion>
          {content.questions.map((item) => (
            <AccordionItem key={item.question}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>
                <p>{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
      <Newsletter {...content.newsletter} />
    </main>
  )
}
