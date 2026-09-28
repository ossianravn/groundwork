import type { ReactNode } from "react"
import { ArrowRight } from "lucide-react"
import type { PublicLinkComponent } from "@/components/public-link"

export function ContactPage({
  children,
  LinkComponent,
}: {
  children: ReactNode
  LinkComponent: PublicLinkComponent
}) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="public-container contact-page"
    >
      <div className="contact-intro">
        <header className="resource-heading">
          <h1>Contact</h1>
          <p>Questions, feedback or a project in mind?</p>
        </header>
        <LinkComponent destination="help" className="resource-text-link">
          Browse help guides <ArrowRight aria-hidden="true" />
        </LinkComponent>
      </div>
      {children}
    </main>
  )
}
