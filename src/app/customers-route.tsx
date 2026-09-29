import { useParams } from "@tanstack/react-router"
import customers from "@/demo/data/public-customers.json"
import { CustomersPage } from "@/features/public/customers-page"
import { CustomerStoryPage } from "@/features/public/customer-story-page"
import { PublicLink, PublicPage, StoryLink } from "./public-page"

export function CustomersRoute() {
  return (
    <PublicPage title="Customers">
      <CustomersPage LinkComponent={PublicLink} StoryLink={StoryLink} />
    </PublicPage>
  )
}

export function CustomerStoryRoute() {
  const { slug } = useParams({ from: "/customers/$slug" })
  const story = customers.stories.find((item) => item.slug === slug)

  return (
    <PublicPage title={story ? story.company : "Story not found"}>
      {story ? (
        <CustomerStoryPage
          story={story}
          LinkComponent={PublicLink}
          StoryLink={StoryLink}
        />
      ) : (
        <main
          id="main-content"
          tabIndex={-1}
          className="public-container customer-story"
        >
          <h1>Story not found</h1>
          <p>This story is not part of the sample site.</p>
          <PublicLink destination="customers">See all stories</PublicLink>
        </main>
      )}
    </PublicPage>
  )
}
