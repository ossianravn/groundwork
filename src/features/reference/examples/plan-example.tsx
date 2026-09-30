import { Plan, PlanStep } from "@/kit/ai/plan"

export function PlanExample() {
  return (
    <Plan
      className="max-w-xl"
      title="Launch checklist for Mobile app"
      description="5 tasks at the end of the project's list. Mia Davis, the owner, takes the first two."
    >
      <PlanStep detail="Mia Davis">Confirm the launch date and scope</PlanStep>
      <PlanStep detail="Mia Davis">Write the release notes</PlanStep>
      <PlanStep detail="Unassigned">Run a final accessibility review</PlanStep>
      <PlanStep detail="Unassigned">Brief the support team</PlanStep>
      <PlanStep detail="Unassigned">Schedule the announcement</PlanStep>
    </Plan>
  )
}
