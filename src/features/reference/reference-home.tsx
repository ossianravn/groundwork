import { ArrowRight } from "lucide-react"
import { buttonVariants } from "@/kit/ui/button"
import { components, componentCategories } from "./catalog"
import type {
  ReferenceLinkComponent,
  ReferenceContextLinkComponent,
} from "./reference-link"

export function ReferenceHome({
  LinkComponent,
  ContextLink,
}: {
  LinkComponent: ReferenceLinkComponent
  ContextLink: ReferenceContextLinkComponent
}) {
  return (
    <div className="reference-stack">
      <header className="reference-heading">
        <h1>Built here. Ready to reuse.</h1>
        <p>
          Explore the components and patterns behind Forma, try their
          interactions, and take the example code into your own project.
        </p>
        <LinkComponent destination="patterns" className={buttonVariants()}>
          Browse patterns{" "}
          <ArrowRight data-icon="inline-end" aria-hidden="true" />
        </LinkComponent>
      </header>
      <section aria-labelledby="reference-start">
        <h2 id="reference-start">Start with the building blocks</h2>
        <div className="reference-category-grid">
          {componentCategories.map((category) => (
            <section key={category}>
              <h3>{category}</h3>
              <ul>
                {components
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <li key={item.id}>
                      <LinkComponent
                        destination="component"
                        component={item.id}
                      >
                        {item.name}
                        <ArrowRight aria-hidden="true" />
                      </LinkComponent>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
      <section className="reference-prose" aria-labelledby="reference-context">
        <h2 id="reference-context">See the complete workflow</h2>
        <p>
          Controls are only part of the design. Explore how they work together
          in project management, team settings, and billing.
        </p>
        <div className="reference-context-links">
          <ContextLink href="/app/demo/projects">
            Projects <ArrowRight aria-hidden="true" />
          </ContextLink>
          <ContextLink href="/app/demo/settings/team">
            Team <ArrowRight aria-hidden="true" />
          </ContextLink>
          <ContextLink href="/app/demo/settings/billing">
            Billing <ArrowRight aria-hidden="true" />
          </ContextLink>
        </div>
      </section>
      <section
        className="reference-prose"
        aria-labelledby="reference-foundations"
      >
        <h2 id="reference-foundations">One shared design system</h2>
        <p>
          Examples use the installed shadcn components with Base UI. Appearance
          changes apply to previews and overlays through the same tokens as the
          website and workspace.
        </p>
        <dl className="reference-source-list">
          <div>
            <dt>Semantic tokens</dt>
            <dd>
              <code>src/styles/theme.css</code>
            </dd>
          </div>
          <div>
            <dt>Shared primitives</dt>
            <dd>
              <code>src/components/ui/</code>
            </dd>
          </div>
          <div>
            <dt>Example source</dt>
            <dd>
              <code>src/features/reference/examples/</code>
            </dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
