import { useState, type ComponentType, type ReactNode } from "react"
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
import { Slider } from "@/kit/ui/slider"
import { buttonVariants } from "@/kit/ui/button"
import {
  plans,
  planPrice,
  teamPrice,
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
  // An estimate for the visitor's team; it stays on this page.
  const [members, setMembers] = useState(10)
  const team = `${members} ${members === 1 ? "member" : "members"}`

  // Prices animate only once the period is switched, not on arrival.
  const [switched, setSwitched] = useState(false)

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
              if (value[0] !== "monthly" && value[0] !== "annual") return
              setSwitched(true)
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
        <div className="pricing-team">
          <p className="pricing-team-label">
            <span id="pricing-team-size">Team size</span>
            <span aria-hidden="true">{team}</span>
          </p>
          <Slider
            aria-labelledby="pricing-team-size"
            min={1}
            max={100}
            value={members}
            onValueChange={setMembers}
            getAriaValueText={(_, value) =>
              `${value} ${value === 1 ? "member" : "members"}`
            }
          />
        </div>
        <div
          className="pricing-grid"
          data-billing={billing}
          data-switched={switched || undefined}
        >
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
                    <span key={price.monthly} className="pricing-figure">
                      {price.monthly}
                    </span>
                    <span className="pricing-unit"> / member / month</span>
                  </p>
                  <p key={billing} className="pricing-team-price">
                    {teamPrice(plan, billing, members)}
                  </p>
                  <p key={price.basis} className="pricing-basis">
                    {price.basis}
                  </p>
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
