import { Check, Minus } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/kit/ui/accordion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/kit/ui/table"
import { plans, planPrice, type BillingPeriod } from "@/demo/billing"
import catalog from "@/demo/data/billing.json"

export function PricingComparison({ billing }: { billing: BillingPeriod }) {
  return (
    <Accordion className="pricing-comparison">
      <AccordionItem value="comparison">
        <AccordionTrigger>Compare all features</AccordionTrigger>
        <AccordionContent>
          <Table
            containerProps={{
              className: "pricing-comparison-scroll",
              tabIndex: 0,
              role: "region",
              "aria-label": "Plan feature comparison",
            }}
          >
            <caption className="sr-only">Plan features by subscription</caption>
            <colgroup>
              <col className="pricing-feature-column" />
              {plans.map((plan) => (
                <col key={plan.id} />
              ))}
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Features</TableHead>
                {plans.map((plan) => {
                  const price = planPrice(plan, billing)

                  return (
                    <TableHead key={plan.id} scope="col">
                      <span className="pricing-comparison-plan">
                        {plan.name}
                      </span>
                      <span className="pricing-comparison-price">
                        <strong>{price.monthly}</strong> / member / month
                      </span>
                      <span className="pricing-comparison-basis">
                        {price.basis}
                      </span>
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            {catalog.comparison.map((group) => (
              <TableBody key={group.label}>
                <TableRow className="pricing-comparison-group">
                  <TableHead colSpan={4} scope="rowgroup">
                    <span>{group.label}</span>
                  </TableHead>
                </TableRow>
                {group.features.map((feature) => (
                  <TableRow key={feature.label}>
                    <TableHead scope="row">{feature.label}</TableHead>
                    {plans.map((plan) => {
                      const included = feature.plans.includes(plan.id)

                      return (
                        <TableCell key={plan.id}>
                          {included ? (
                            <Check aria-hidden="true" />
                          ) : (
                            <Minus
                              aria-hidden="true"
                              className="text-muted-foreground"
                            />
                          )}
                          <span className="sr-only">
                            {included ? "Included" : "Not included"}
                          </span>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            ))}
          </Table>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
