import type { ReactNode } from "react"
import { ArrowLeft } from "lucide-react"
import { Empty, EmptyHeader, EmptyDescription } from "@/kit/ui/empty"
import { buttonVariants } from "@/kit/ui/button"
import type { ContentSection, Guide } from "./content"
import type { ResourceCollection, ResourceLinkComponent } from "./resource-link"
import { useReaderScrollspy } from "./use-reader-scrollspy"

export function ContentSections({ sections }: { sections: ContentSection[] }) {
  return sections.map((section) => (
    <section key={section.id} aria-labelledby={section.id}>
      <h2 id={section.id} tabIndex={-1}>
        {section.title}
      </h2>
      {section.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {section.steps && (
        <ol>
          {section.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      )}
      {section.bullets && (
        <ul>
          {section.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  ))
}

export function ContentReader({
  title,
  summary,
  sections,
  meta,
  backLink,
  figure,
  children,
}: {
  title: string
  summary: string
  sections: ContentSection[]
  meta: ReactNode
  backLink: ReactNode
  figure?: ReactNode
  children: ReactNode
}) {
  const { contentRef, activeId } = useReaderScrollspy(sections)

  const toc = (
    <nav aria-label="On this page">
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          aria-current={activeId === section.id ? "location" : undefined}
        >
          {section.title}
        </a>
      ))}
    </nav>
  )

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="public-container resource-reader"
    >
      <div className="resource-back">{backLink}</div>
      <div className="resource-reading-grid">
        <article ref={contentRef} className="resource-prose">
          <header className="resource-heading">
            <div className="resource-meta">{meta}</div>
            <h1>{title}</h1>
            <p>{summary}</p>
          </header>
          <details className="resource-mobile-toc">
            <summary>On this page</summary>
            {toc}
          </details>
          {figure}
          <ContentSections sections={sections} />
          {children}
        </article>
        <aside className="resource-desktop-toc">
          <span>On this page</span>
          {toc}
        </aside>
      </div>
    </main>
  )
}

export function RelatedGuides({
  title,
  entries,
  collection,
  LinkComponent,
}: {
  title: string
  entries: Guide[]
  collection: ResourceCollection
  LinkComponent: ResourceLinkComponent
}) {
  return (
    <section className="resource-related" aria-labelledby="related-title">
      <h2 id="related-title">{title}</h2>
      <ul>
        {entries.map((entry) => (
          <li key={entry.slug}>
            <LinkComponent collection={collection} slug={entry.slug}>
              {entry.title}
            </LinkComponent>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function MissingResource({
  collection,
  label,
  LinkComponent,
}: {
  collection: ResourceCollection
  label: string
  LinkComponent: ResourceLinkComponent
}) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="public-container resource-index"
    >
      <Empty>
        <EmptyHeader>
          <h1 className="text-xl font-semibold">Page not found</h1>
          <EmptyDescription>
            This entry is unavailable. Browse {label.toLowerCase()} to find
            another.
          </EmptyDescription>
        </EmptyHeader>
        <LinkComponent
          collection={collection}
          className={buttonVariants({ variant: "outline" })}
        >
          <ArrowLeft aria-hidden="true" /> Back to {label.toLowerCase()}
        </LinkComponent>
      </Empty>
    </main>
  )
}
