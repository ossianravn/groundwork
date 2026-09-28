import { useState, type RefObject } from "react"
import { Button } from "@/kit/ui/button"
import { FieldSet, FieldLegend, FieldLabel, Field } from "@/kit/ui/field"
import { RadioGroup, RadioGroupItem } from "@/kit/ui/radio-group"
import { ToggleGroup, ToggleGroupItem } from "@/kit/ui/toggle-group"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/kit/ui/dialog"
import {
  plans,
  parsePlan,
  parseBilling,
  workspacePlanAmount,
  formatBillingAmount,
  type PlanSelection,
} from "@/demo/billing"

export function PlanDialog({
  selection,
  members,
  onSave,
  onClose,
  returnFocus,
}: {
  selection?: PlanSelection
  members: number
  onSave: (selection: PlanSelection) => void
  onClose: () => void
  returnFocus: RefObject<HTMLElement | null>
}) {
  const [draft, setDraft] = useState<PlanSelection>(
    selection ?? { plan: "starter", billing: "monthly" },
  )

  const unchanged =
    draft.plan === selection?.plan && draft.billing === selection.billing

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        className="billing-plan-dialog"
        showCloseButton={false}
        finalFocus={returnFocus}
      >
        <DialogHeader showCloseButton>
          <DialogTitle>
            {selection ? "Manage plan" : "Choose a plan"}
          </DialogTitle>
          <DialogDescription>
            Sample plans. No payment is collected.
          </DialogDescription>
        </DialogHeader>
        <form
          className="settings-form"
          onSubmit={(event) => {
            event.preventDefault()
            onSave(draft)
            onClose()
          }}
        >
          <ToggleGroup
            multiple={false}
            value={[draft.billing]}
            variant="outline"
            aria-label="Billing period"
            onValueChange={(value) => {
              if (value.length)
                setDraft({ ...draft, ...parseBilling({ billing: value[0] }) })
            }}
          >
            <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
            <ToggleGroupItem value="annual">Yearly</ToggleGroupItem>
          </ToggleGroup>
          <FieldSet>
            <FieldLegend className="sr-only" id="plan-legend">
              Plan
            </FieldLegend>
            <RadioGroup
              value={draft.plan}
              aria-labelledby="plan-legend"
              onValueChange={(value) => {
                const plan = parsePlan({ plan: value })

                if (plan) setDraft({ ...draft, plan })
              }}
            >
              {plans.map((plan) => (
                <FieldLabel
                  key={plan.id}
                  className="billing-plan-option"
                  htmlFor={`plan-${plan.id}`}
                >
                  <Field orientation="horizontal">
                    <RadioGroupItem id={`plan-${plan.id}`} value={plan.id} />
                    <strong>{plan.name}</strong>
                    <span className="billing-plan-price">
                      <strong>
                        {formatBillingAmount(plan[draft.billing])}
                      </strong>
                      <span>
                        / member /{" "}
                        {draft.billing === "annual" ? "year" : "month"}
                      </span>
                    </span>
                  </Field>
                </FieldLabel>
              ))}
            </RadioGroup>
          </FieldSet>
          <div
            className="billing-plan-total"
            aria-live="polite"
            aria-atomic="true"
          >
            <span>
              {members} {members === 1 ? "member" : "members"}
            </span>
            <strong>
              {formatBillingAmount(workspacePlanAmount(draft, members))}
              <span> / {draft.billing === "annual" ? "year" : "month"}</span>
            </strong>
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit" disabled={unchanged}>
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
