import { ArrowLeft, ArrowRight } from "lucide-react"
import { Badge } from "@/kit/ui/badge"
import { releases, guides, contentDate, type Release } from "./content"
import { ContentReader } from "./content-reader"
import type { ResourceLinkComponent } from "./resource-link"

export function ChangelogPage({
  LinkComponent,
}: {
  LinkComponent: ResourceLinkComponent
}) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="public-container resource-index changelog-page"
    >
      <header className="resource-heading">
        <h1>Changelog</h1>
        <p>What's new in Forma.</p>
        <p className="resource-note">
          Sample release notes for this interactive demo.
        </p>
      </header>
      <div className="release-timeline">
        {releases.map((release) => (
          <article key={release.version}>
            <div className="release-date">
              <time dateTime={release.date}>{contentDate(release.date)}</time>
              <Badge variant="outline">v{release.version}</Badge>
            </div>
            <div>
              <h2>
                <LinkComponent collection="changelog" slug={release.version}>
                  {release.title}
                </LinkComponent>
              </h2>
              <p>{release.summary}</p>
              <ul>
                {release.sections[0].bullets?.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <LinkComponent
                collection="changelog"
                slug={release.version}
                className="resource-text-link"
                aria-label={`Read release v${release.version}`}
              >
                Release notes <ArrowRight aria-hidden="true" />
              </LinkComponent>
            </div>
          </article>
        ))}
      </div>
    </main>
  )
}

export function ReleasePage({
  release,
  LinkComponent,
}: {
  release: Release
  LinkComponent: ResourceLinkComponent
}) {
  const index = releases.findIndex((entry) => entry.version === release.version)
  const newer = releases[index - 1]
  const older = releases[index + 1]
  const guide = guides.find((entry) => entry.slug === release.guide)

  return (
    <ContentReader
      title={release.title}
      summary={release.summary}
      sections={release.sections}
      meta={
        <>
          <Badge variant="outline">v{release.version}</Badge>
          <time dateTime={release.date}>{contentDate(release.date)}</time>
          <span>Sample release</span>
        </>
      }
      backLink={
        <LinkComponent collection="changelog">
          <ArrowLeft aria-hidden="true" /> Changelog
        </LinkComponent>
      }
    >
      {guide && (
        <p className="release-guide">
          <LinkComponent collection="help" slug={guide.slug}>
            {guide.title} <ArrowRight aria-hidden="true" />
          </LinkComponent>
        </p>
      )}
      <nav className="release-pagination" aria-label="Releases">
        {older && (
          <LinkComponent collection="changelog" slug={older.version}>
            <ArrowLeft aria-hidden="true" />
            <span>
              Older release<strong>v{older.version}</strong>
            </span>
          </LinkComponent>
        )}
        {newer && (
          <LinkComponent
            collection="changelog"
            slug={newer.version}
            className="release-newer"
          >
            <span>
              Newer release<strong>v{newer.version}</strong>
            </span>
            <ArrowRight aria-hidden="true" />
          </LinkComponent>
        )}
      </nav>
    </ContentReader>
  )
}
