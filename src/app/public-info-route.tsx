import { ArrowLeft } from "lucide-react"
import { useSearch } from "@tanstack/react-router"
import { ContactPage } from "@/features/public/contact-page"
import { ContactForm } from "@/features/public/contact-form"
import { ContentReader } from "@/features/resources/content-reader"
import { contentDate } from "@/features/resources/content"
import content from "@/demo/data/content.json"
import scenarios from "@/demo/data/scenarios.json"
import { PublicPage, PublicLink } from "./public-page"
import { useDemoState } from "./demo-state"

export function ContactRoute() {
  const { contact } = useDemoState()
  const { scenario } = useSearch({ from: "/contact" })

  return (
    <PublicPage title="Contact">
      <ContactPage LinkComponent={PublicLink}>
        <ContactForm
          state={contact.state}
          onChange={contact.update}
          onSubmit={() => contact.submit(scenario)}
          onRestart={contact.reset}
          failureMessage={scenarios["contact-failure"].message}
          LinkComponent={PublicLink}
        />
      </ContactPage>
    </PublicPage>
  )
}

function PolicyPage({ page }: { page: "privacy" | "terms" }) {
  const policy = content.policies[page]

  return (
    <PublicPage title={policy.title}>
      <ContentReader
        title={policy.title}
        summary={policy.summary}
        sections={policy.sections}
        meta={
          <span>
            Sample · Updated{" "}
            <time dateTime={policy.date}>{contentDate(policy.date)}</time>
          </span>
        }
        backLink={
          <PublicLink destination="home">
            <ArrowLeft aria-hidden="true" /> Home
          </PublicLink>
        }
      >
        <nav className="policy-related" aria-label="Related information">
          <PublicLink destination={page === "privacy" ? "terms" : "privacy"}>
            {page === "privacy" ? "Terms" : "Privacy"}
          </PublicLink>
          <PublicLink destination="contact">Contact demo</PublicLink>
        </nav>
      </ContentReader>
    </PublicPage>
  )
}

export function PrivacyRoute() {
  return <PolicyPage page="privacy" />
}

export function TermsRoute() {
  return <PolicyPage page="terms" />
}
