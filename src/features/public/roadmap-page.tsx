import { ArrowUpRight, ThumbsUp } from "lucide-react"
import { Button } from "@/kit/ui/button"
import type { PublicLinkComponent } from "@/components/public-link"
import company from "@/demo/data/public-company.json"

const stages = ["Now", "Next", "Later", "Shipped"]

// The public roadmap (MKT-21): what is in progress, next and later, with a
// vote per idea, and shipped work linked to its release notes.
export function RoadmapPage({
  LinkComponent,
  voted,
  onVote,
}: {
  LinkComponent: PublicLinkComponent
  /** Ideas this visitor has voted for in this session. */
  voted: string[]
  onVote: (id: string) => void
}) {
  return (
    <main id="main-content" tabIndex={-1} className="company-page">
      <header className="public-page-heading public-container">
        <h1>Where Tandem is going.</h1>
        <p>
          Vote for the ideas that matter to you. Votes are kept for this visit
          only; the plans are sample content.
        </p>
      </header>
      <div className="roadmap public-container">
        {stages.map((stage) => (
          <section key={stage} aria-labelledby={`roadmap-${stage}`}>
            <h2 id={`roadmap-${stage}`}>{stage}</h2>
            <ul>
              {company.roadmap
                .filter((item) => item.stage === stage)
                .map((item) => {
                  const mine = voted.includes(item.id)

                  return (
                    <li key={item.id}>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                      {item.release ? (
                        <LinkComponent destination="changelog">
                          Release notes
                          <ArrowUpRight aria-hidden="true" />
                        </LinkComponent>
                      ) : (
                        <Button
                          variant={mine ? "secondary" : "outline"}
                          size="sm"
                          aria-pressed={mine}
                          aria-label={`Vote for ${item.title}, ${item.votes + (mine ? 1 : 0)} votes`}
                          onClick={() => onVote(item.id)}
                        >
                          <ThumbsUp
                            aria-hidden="true"
                            data-icon="inline-start"
                          />
                          {item.votes + (mine ? 1 : 0)}
                        </Button>
                      )}
                    </li>
                  )
                })}
            </ul>
          </section>
        ))}
      </div>
    </main>
  )
}
