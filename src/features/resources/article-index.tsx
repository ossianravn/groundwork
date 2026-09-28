import { ArrowRight } from "lucide-react"
import { articles, contentDate } from "./content"
import type { ResourceLinkComponent } from "./resource-link"

export function ArticleIndex({
  LinkComponent,
}: {
  LinkComponent: ResourceLinkComponent
}) {
  const [featured, ...more] = articles

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="public-container resource-index"
    >
      <header className="resource-heading">
        <h1>Articles</h1>
        <p>Practical ideas for clearer projects and better handoffs.</p>
      </header>
      <article className="resource-featured">
        <LinkComponent
          collection="blog"
          slug={featured.slug}
          className="resource-featured-image"
          tabIndex={-1}
          aria-hidden="true"
        >
          <img src={featured.image} width={1280} height={860} alt="" />
        </LinkComponent>
        <div>
          <div className="resource-meta">
            <span>{featured.topic}</span>
            <time dateTime={featured.date}>{contentDate(featured.date)}</time>
          </div>
          <h2>
            <LinkComponent collection="blog" slug={featured.slug}>
              {featured.title}
            </LinkComponent>
          </h2>
          <p>{featured.summary}</p>
          <LinkComponent
            collection="blog"
            slug={featured.slug}
            className="resource-text-link"
            aria-label={`Read article: ${featured.title}`}
          >
            Read article <ArrowRight aria-hidden="true" />
          </LinkComponent>
        </div>
      </article>
      <section className="resource-article-grid" aria-label="More articles">
        {more.map((article) => (
          <article key={article.slug}>
            <div className="resource-meta">
              <span>{article.topic}</span>
              <time dateTime={article.date}>{contentDate(article.date)}</time>
            </div>
            <h2>
              <LinkComponent collection="blog" slug={article.slug}>
                {article.title}
              </LinkComponent>
            </h2>
            <p>{article.summary}</p>
            <LinkComponent
              collection="blog"
              slug={article.slug}
              className="resource-text-link"
              aria-label={`Read article: ${article.title}`}
            >
              Read article <ArrowRight aria-hidden="true" />
            </LinkComponent>
          </article>
        ))}
      </section>
    </main>
  )
}
