import { AboutPage } from "@/features/public/about-page"
import { IntegrationsPage } from "@/features/public/integrations-page"
import { RoadmapPage } from "@/features/public/roadmap-page"
import { StatusPage } from "@/features/public/status-page"
import { useDemoState } from "./demo-state"
import { PublicLink, PublicPage } from "./public-page"

export function IntegrationsRoute() {
  return (
    <PublicPage title="Integrations">
      <IntegrationsPage />
    </PublicPage>
  )
}

export function AboutRoute() {
  return (
    <PublicPage title="About">
      <AboutPage LinkComponent={PublicLink} />
    </PublicPage>
  )
}

export function RoadmapRoute() {
  const { results } = useDemoState()

  return (
    <PublicPage title="Roadmap">
      <RoadmapPage
        LinkComponent={PublicLink}
        voted={results.roadmapVotes}
        onVote={(id) =>
          results.setRoadmapVotes((current) =>
            current.includes(id)
              ? current.filter((item) => item !== id)
              : [...current, id],
          )
        }
      />
    </PublicPage>
  )
}

export function StatusRoute() {
  return (
    <PublicPage title="Status">
      <StatusPage />
    </PublicPage>
  )
}
