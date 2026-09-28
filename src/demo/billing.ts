import catalog from "./data/billing.json"

export type BillingPeriod = "monthly" | "annual"

export type PlanId = "starter" | "team" | "business"

export interface PlanSelection {
  plan: PlanId
  billing: BillingPeriod
}

export interface Invoice {
  id: string
  date: string
  customer: string
  description: string
  members: number
  unitAmount: number
  status: string
  file: string
}

export const sampleInvoices: Invoice[] = catalog.invoices

export function workspacePlanAmount(selection: PlanSelection, members: number) {
  return getPlan(selection.plan)[selection.billing] * members
}

const invoiceCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: catalog.currency,
  currencyDisplay: "code",
})

export function formatBillingAmount(amount: number) {
  return invoiceCurrency.format(amount)
}

export interface Plan {
  id: PlanId
  name: string
  description: string
  monthly: number
  annual: number
  highlights: string[]
}

interface PlanSearchInput {
  plan?: unknown
  billing?: unknown
}

interface BillingChoice {
  billing: BillingPeriod
}

export function parsePlan({
  plan: value,
}: PlanSearchInput): PlanId | undefined {
  return value === "starter" || value === "team" || value === "business"
    ? value
    : undefined
}

export function parseBilling({ billing }: PlanSearchInput): BillingChoice {
  return { billing: billing === "annual" ? "annual" : "monthly" }
}

const initialPlan = parsePlan(catalog.subscription)

if (!initialPlan) throw new Error("Unknown sample subscription plan")

export const sampleSubscription: PlanSelection = {
  plan: initialPlan,
  ...parseBilling(catalog.subscription),
}

export const plans: Plan[] = catalog.plans.map((plan) => {
  const id = parsePlan({ plan: plan.id })

  if (!id) throw new Error(`Unknown plan in the sample catalog: ${plan.id}`)

  return { ...plan, id }
})

export function getPlan(id: PlanId): Plan {
  const plan = plans.find((item) => item.id === id)

  if (!plan) throw new Error(`Missing sample plan: ${id}`)

  return plan
}

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: catalog.currency,
  maximumFractionDigits: 0,
})

export function planPrice(plan: Plan, billing: BillingPeriod) {
  return {
    monthly: currency.format(
      billing === "annual" ? plan.annual / 12 : plan.monthly,
    ),
    basis:
      plan.monthly === 0
        ? "Free — no billing"
        : `${currency.format(plan[billing])} per member, billed ${billing === "annual" ? "yearly" : "monthly"}`,
  }
}
