import type { ComponentType, ReactNode } from "react"
import { Check } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/kit/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/kit/ui/toggle-group"
import { buttonVariants } from "@/kit/ui/button"
import {
  plans,
  planPrice,
  type BillingPeriod,
  type PlanSelection,
} from "@/demo/billing"
import catalog from "@/demo/data/billing.json"
import { PublicFaq } from "./public-faq"
import { PricingComparison } from "./pricing-comparison"

export type PlanLinkProps = {
  selection: PlanSelection
  className: string
  children: ReactNode
}

export function PricingPage({
  billing,
  onBillingChange,
  PlanLink,
}: {
  billing: BillingPeriod
  onBillingChange: (value: BillingPeriod) => void
  PlanLink: ComponentType<PlanLinkProps>
}) {
  return (
    <main id="main-content" tabIndex={-1}>
      <header className="public-page-heading public-container">
        <h1>Room for your next chapter.</h1>
        <p>
          Start with your own projects. Bring your team along when you’re ready.
        </p>
      </header>
      <section
        className="public-container pricing-section"
        aria-label="Sample plans"
      >
        <div className="pricing-period">
          <ToggleGroup
            aria-label="Billing period"
            multiple={false}
            value={[billing]}
            onValueChange={(value) => {
              if (value[0] === "monthly" || value[0] === "annual")
                onBillingChange(value[0])
            }}
            variant="outline"
            spacing={0}
          >
            <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
            <ToggleGroupItem value="annual">Yearly</ToggleGroupItem>
          </ToggleGroup>
          <span className="text-muted-foreground">
            Two months free with yearly billing
          </span>
        </div>
        <div className="pricing-grid">
          {plans.map((plan) => {
            const price = planPrice(plan, billing)

            return (
              <Card
                key={plan.id}
                className="pricing-card"
                data-featured={plan.id === "team" || undefined}
              >
                <CardHeader>
                  <CardTitle role="heading" aria-level={2}>
                    {plan.name}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="pricing-amount">
                    {price.monthly}
                    <span> / member / month</span>
                  </p>
                  <p className="pricing-basis">{price.basis}</p>
                  <ul>
                    {plan.highlights.map((highlight) => (
                      <li key={highlight}>
                        <Check aria-hidden="true" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <PlanLink
                    selection={{ plan: plan.id, billing }}
                    className={buttonVariants({
                      variant: plan.id === "team" ? "default" : "outline",
                    })}
                  >
                    Choose {plan.name}
                  </PlanLink>
                </CardFooter>
              </Card>
            )
          })}
        </div>
        <PricingComparison billing={billing} />
      </section>
      <PublicFaq title="About the plans" questions={catalog.questions} />
    </main>
  )
}
