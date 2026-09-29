import type {
  PublicLinkComponent,
  StoryLinkComponent,
} from "@/components/public-link"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/kit/ui/carousel"
import customers from "@/demo/data/public-customers.json"
import { StoryCard } from "./story-card"

// Home's customer stories (KIT-11 carousel): one story at a time on phones,
// about three on wide screens; the controls sit beside the heading.
export function CustomerStories({
  LinkComponent,
  StoryLink,
}: {
  LinkComponent: PublicLinkComponent
  StoryLink: StoryLinkComponent
}) {
  const stories = customers.stories

  return (
    <Carousel
      label="Customer stories"
      className="customer-stories public-container"
    >
      <div className="customer-stories-heading">
        <div className="public-section-heading">
          <h2>Teams that plan in Tandem.</h2>
          <p>
            Sample stories from fictional teams, told with the features in the
            demo.{" "}
            <LinkComponent destination="customers">All stories</LinkComponent>
          </p>
        </div>
        <div className="customer-stories-controls">
          <CarouselPrevious />
          <CarouselNext />
        </div>
      </div>
      <CarouselContent>
        {stories.map((story, index) => (
          <CarouselItem key={story.slug} index={index} count={stories.length}>
            <StoryCard story={story} StoryLink={StoryLink} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
