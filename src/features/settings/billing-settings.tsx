import { useRef, useState } from "react"
import { Button } from "@/kit/ui/button"
import { InvoiceHistory } from "./invoice-history"
import { PlanDialog } from "./plan-dialog"
import {
  getPlan,
  planPrice,
  workspacePlanAmount,
  formatBillingAmount,
  type PlanSelection,
  type Invoice,
} from "@/demo/billing"

export function BillingSettings({
  selection,
  invoices,
  members,
  projects,
  onSave,
}: {
  selection?: PlanSelection
  invoices: Invoice[]
  members: number
  projects: number
  onSave: (selection: PlanSelection) => void
}) {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const plan = selection ? getPlan(selection.plan) : undefined

  return (
    <div className="settings-form">
      <header className="settings-section-heading">
        <h2 id="settings-title">Billing</h2>
        <p>Sample subscription and invoices. No real charges.</p>
      </header>
      <section className="billing-current" aria-labelledby="current-plan-title">
        <div className="billing-current-heading">
          <h3 id="current-plan-title">{plan?.name ?? "No plan selected"}</h3>
          <Button ref={trigger} variant="outline" onClick={() => setOpen(true)}>
            {plan ? "Manage plan" : "Choose plan"}
          </Button>
        </div>
        {selection && plan && (
          <div className="billing-current-price">
            <p>
              <strong>
                {formatBillingAmount(workspacePlanAmount(selection, members))}
              </strong>
              <span>
                {" "}
                / {selection.billing === "annual" ? "year" : "month"}
              </span>
            </p>
            <p>{planPrice(plan, selection.billing).basis}</p>
          </div>
        )}
        <dl className="billing-workspace-counts">
          <div>
            <dt>Members</dt>
            <dd>{members}</dd>
          </div>
          <div>
            <dt>Projects</dt>
            <dd>{projects}</dd>
          </div>
        </dl>
      </section>
      <InvoiceHistory invoices={invoices} />
      {open && (
        <PlanDialog
          selection={selection}
          members={members}
          onSave={onSave}
          onClose={() => setOpen(false)}
          returnFocus={trigger}
        />
      )}
    </div>
  )
}
