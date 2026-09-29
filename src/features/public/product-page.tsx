import { ArrowUpRight } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/kit/ui/tabs"
import { buttonVariants } from "@/kit/ui/button"
import type {
  PublicDestination,
  PublicLinkComponent,
} from "@/components/public-link"
import content from "@/demo/data/public-product.json"
import { PublicFaq } from "./public-faq"
import { ProductFeatures } from "./product-features"
import { HowItWorks } from "./how-it-works"

const previews = [
  { ...content.previews[0], destination: "demo" },
  { ...content.previews[1], destination: "board" },
  { ...content.previews[2], destination: "project-detail" },
] satisfies ((typeof content.previews)[number] & {
  destination: PublicDestination
})[]

export function ProductPage({
  LinkComponent,
}: {
  LinkComponent: PublicLinkComponent
}) {
  return (
    <main id="main-content" tabIndex={-1}>
      <header className="public-page-heading public-container">
        <h1>{content.title}</h1>
        <p>{content.description}</p>
        <LinkComponent destination="demo" className={buttonVariants()}>
          Open demo
          <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
        </LinkComponent>
      </header>
      <section
        className="public-container product-showcase"
        aria-label="Explore Tandem"
      >
        <Tabs defaultValue="overview">
          <TabsList aria-label="Product previews" variant="line">
            {previews.map((preview) => (
              <TabsTrigger key={preview.id} value={preview.id}>
                {preview.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {previews.map((preview) => (
            <TabsContent key={preview.id} value={preview.id}>
              <div className="product-preview-heading">
                <div>
                  <h2>{preview.title}</h2>
                  <p>{preview.description}</p>
                </div>
                <LinkComponent
                  destination={preview.destination}
                  className={buttonVariants({ variant: "outline" })}
                >
                  {preview.action}
                  <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
                </LinkComponent>
              </div>
              <figure className="public-product-preview">
                <span className="public-stage" aria-hidden="true" />
                <img
                  src={preview.image}
                  width={1280}
                  height={860}
                  alt={preview.alt}
                />
                <figcaption>Studio North · Sample workspace</figcaption>
              </figure>
            </TabsContent>
          ))}
        </Tabs>
      </section>
      <HowItWorks LinkComponent={LinkComponent} />
      <ProductFeatures />
      <PublicFaq questions={content.questions} />
    </main>
  )
}
