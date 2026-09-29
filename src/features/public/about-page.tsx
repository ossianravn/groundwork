import { ArrowUpRight } from "lucide-react"
import type { PublicLinkComponent } from "@/components/public-link"
import company from "@/demo/data/public-company.json"

// About and careers (MKT-20): who makes Tandem, what they value, and the
// sample roles open now.
export function AboutPage({
  LinkComponent,
}: {
  LinkComponent: PublicLinkComponent
}) {
  const { about } = company

  return (
    <main id="main-content" tabIndex={-1} className="company-page">
      <header className="public-page-heading public-container">
        <h1>{about.headline}</h1>
        <p>{about.intro}</p>
      </header>
      <section className="about-story public-container" aria-label="Our story">
        {about.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>
      <section
        className="about-values public-container"
        aria-labelledby="values-title"
      >
        <div className="public-section-heading">
          <h2 id="values-title">What we hold to.</h2>
        </div>
        <ul>
          {about.values.map((value, index) => (
            <li key={value.title}>
              <span aria-hidden="true">{index + 1}</span>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </li>
          ))}
        </ul>
      </section>
      <section
        id="careers"
        tabIndex={-1}
        className="about-roles public-container"
        aria-labelledby="roles-title"
      >
        <div className="public-section-heading">
          <h2 id="roles-title">Open roles.</h2>
          <p>
            Sample roles for the template. Questions go through the contact
            form.
          </p>
        </div>
        <ul>
          {about.roles.map((role) => (
            <li key={role.id}>
              <h3>{role.title}</h3>
              <p>
                {role.team} · {role.location} · {role.type}
              </p>
              <LinkComponent destination="contact">
                Ask about this role
                <span className="sr-only">: {role.title}</span>
                <ArrowUpRight aria-hidden="true" />
              </LinkComponent>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
