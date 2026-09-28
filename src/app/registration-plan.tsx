import { Link } from "@tanstack/react-router"
import { getPlan, planPrice, type PlanSelection } from "@/demo/billing"

export function RegistrationPlan({
  selection,
}: {
  selection: PlanSelection | undefined
}) {
  if (!selection) return null
  const plan = getPlan(selection.plan)

  return (
    <span className="registration-plan">
      <span>
        <strong>{plan.name}</strong>
        <span className="registration-plan-price">
          {planPrice(plan, selection.billing).basis}
        </span>
      </span>
      <Link
        to="/pricing"
        search={{ billing: selection.billing }}
        className="access-link"
      >
        Change plan
      </Link>
    </span>
  )
}
