import { useRef } from "react"
import { ArrowRight, Search, X } from "lucide-react"
import { Button } from "@/kit/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/kit/ui/input-group"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/kit/ui/accordion"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/kit/ui/empty"
import { guides, questions, searchGuides } from "./content"
import type { ResourceLinkComponent } from "./resource-link"

export function HelpPage({
  query,
  hash,
  onQueryChange,
  LinkComponent,
}: {
  query: string
  hash: string
  onQueryChange: (query: string) => void
  LinkComponent: ResourceLinkComponent
}) {
  const input = useRef<HTMLInputElement>(null)
  const results = searchGuides(query)
  const searching = query.trim().length !== 0
  const topics = [...new Set(guides.map((guide) => guide.topic))]

  function clearSearch() {
    onQueryChange("")
    input.current?.focus()
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="public-container resource-index help-page"
    >
      <header className="resource-heading">
        <h1>How can we help?</h1>
        <p>Find your way around projects, your team and the demo.</p>
        <search className="help-search" aria-label="Help guides">
          <InputGroup>
            <InputGroupAddon>
              <Search aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              ref={input}
              type="search"
              aria-label="Search help"
              placeholder="Search help…"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
            />
            {query && (
              <InputGroupAddon align="inline-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  <X aria-hidden="true" />
                </Button>
              </InputGroupAddon>
            )}
          </InputGroup>
        </search>
      </header>
      <p className="sr-only" role="status">
        {searching ? `${results.length} matching guides` : "All help topics"}
      </p>
      {searching ? (
        <section className="help-results" aria-label="Search results">
          {results.length ? (
            <>
              <h2>
                {results.length} {results.length === 1 ? "guide" : "guides"}{" "}
                found
              </h2>
              <ul>
                {results.map((guide) => (
                  <li key={guide.slug}>
                    <LinkComponent collection="help" slug={guide.slug}>
                      <h3>{guide.title}</h3>
                      <p>{guide.summary}</p>
                      <ArrowRight aria-hidden="true" />
                    </LinkComponent>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No guides found</EmptyTitle>
                <EmptyDescription>
                  Try a different term, such as “draft”, “owner” or
                  “appearance”.
                </EmptyDescription>
              </EmptyHeader>
              <Button variant="outline" onClick={clearSearch}>
                Clear search
              </Button>
            </Empty>
          )}
        </section>
      ) : (
        <div className="help-topics">
          {topics.map((topic) => (
            <section key={topic}>
              <h2>{topic}</h2>
              <ul>
                {guides
                  .filter((guide) => guide.topic === topic)
                  .map((guide) => (
                    <li key={guide.slug}>
                      <LinkComponent collection="help" slug={guide.slug}>
                        {guide.title}
                        <ArrowRight aria-hidden="true" />
                      </LinkComponent>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      )}
      <section className="help-questions" aria-labelledby="help-faq-title">
        <h2 id="help-faq-title">Common questions</h2>
        <Accordion
          key={hash}
          defaultValue={
            questions.some((question) => question.id === hash) ? [hash] : []
          }
        >
          {questions.map((question) => (
            <AccordionItem key={question.id} value={question.id}>
              <AccordionTrigger id={question.id}>
                {question.question}
              </AccordionTrigger>
              <AccordionContent>
                <p>{question.answer}</p>
                <div className="help-answer-links">
                  <LinkComponent collection="help" slug={question.guide}>
                    Read the guide
                  </LinkComponent>
                  <a
                    href={`#${question.id}`}
                    aria-label={`Link to question: ${question.question}`}
                  >
                    Link to answer
                  </a>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </main>
  )
}
