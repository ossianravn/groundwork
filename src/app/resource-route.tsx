import { ArrowLeft } from "lucide-react"
import {
  useLocation,
  useNavigate,
  useParams,
  useSearch,
} from "@tanstack/react-router"
import { ArticleIndex } from "@/features/resources/article-index"
import { HelpPage } from "@/features/resources/help-page"
import { ChangelogPage, ReleasePage } from "@/features/resources/changelog-page"
import {
  ContentReader,
  RelatedGuides,
  MissingResource,
} from "@/features/resources/content-reader"
import {
  articles,
  guides,
  releases,
  contentDate,
} from "@/features/resources/content"
import { PublicPage } from "./public-page"
import { ResourceLink } from "./resource-link"

export function BlogRoute() {
  return (
    <PublicPage title="Articles">
      <ArticleIndex LinkComponent={ResourceLink} />
    </PublicPage>
  )
}

export function ArticleRoute() {
  const { slug } = useParams({ from: "/blog/$slug" })
  const article = articles.find((entry) => entry.slug === slug)

  return (
    <PublicPage title={article?.title ?? "Article not found"}>
      {article ? (
        <ContentReader
          title={article.title}
          summary={article.summary}
          sections={article.sections}
          meta={
            <>
              <span>Tandem team</span>
              <time dateTime={article.date}>{contentDate(article.date)}</time>
            </>
          }
          backLink={
            <ResourceLink collection="blog">
              <ArrowLeft aria-hidden="true" /> Articles
            </ResourceLink>
          }
          figure={
            <figure>
              <img
                src={article.image}
                width={1280}
                height={860}
                alt={article.alt}
              />
              <figcaption>{article.caption}</figcaption>
            </figure>
          }
        >
          <RelatedGuides
            title="Keep reading"
            collection="blog"
            entries={articles.filter((entry) =>
              article.related.includes(entry.slug),
            )}
            LinkComponent={ResourceLink}
          />
        </ContentReader>
      ) : (
        <MissingResource
          collection="blog"
          label="Articles"
          LinkComponent={ResourceLink}
        />
      )}
    </PublicPage>
  )
}

export function HelpRoute() {
  const { q } = useSearch({ from: "/help" })
  const hash = useLocation({ select: (location) => location.hash })
  const navigate = useNavigate()

  return (
    <PublicPage title="Help">
      <HelpPage
        query={q}
        hash={hash}
        LinkComponent={ResourceLink}
        onQueryChange={(value) => {
          void navigate({
            to: "/help",
            search: { q: value },
            hash,
            hashScrollIntoView: false,
            replace: true,
            resetScroll: false,
          })
        }}
      />
    </PublicPage>
  )
}

export function GuideRoute() {
  const { slug } = useParams({ from: "/help/$slug" })
  const guide = guides.find((entry) => entry.slug === slug)

  return (
    <PublicPage title={guide?.title ?? "Guide not found"}>
      {guide ? (
        <ContentReader
          title={guide.title}
          summary={guide.summary}
          sections={guide.sections}
          meta={
            <>
              <span>{guide.topic}</span>
              <span>
                Updated{" "}
                <time dateTime={guide.date}>{contentDate(guide.date)}</time>
              </span>
            </>
          }
          backLink={
            <ResourceLink collection="help">
              <ArrowLeft aria-hidden="true" /> Help
            </ResourceLink>
          }
        >
          <RelatedGuides
            title="Related guides"
            collection="help"
            entries={guides.filter((entry) =>
              guide.related.includes(entry.slug),
            )}
            LinkComponent={ResourceLink}
          />
        </ContentReader>
      ) : (
        <MissingResource
          collection="help"
          label="Help"
          LinkComponent={ResourceLink}
        />
      )}
    </PublicPage>
  )
}

export function ChangelogRoute() {
  return (
    <PublicPage title="Changelog">
      <ChangelogPage LinkComponent={ResourceLink} />
    </PublicPage>
  )
}

export function ReleaseRoute() {
  const { version } = useParams({ from: "/changelog/$version" })
  const release = releases.find((entry) => entry.version === version)

  return (
    <PublicPage
      title={release ? `v${release.version} · Changelog` : "Release not found"}
    >
      {release ? (
        <ReleasePage release={release} LinkComponent={ResourceLink} />
      ) : (
        <MissingResource
          collection="changelog"
          label="Changelog"
          LinkComponent={ResourceLink}
        />
      )}
    </PublicPage>
  )
}
