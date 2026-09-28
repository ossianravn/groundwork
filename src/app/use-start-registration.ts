import type { PlanSelection } from "@/demo/billing"
import { useDemoState } from "./demo-state"

export function useStartRegistration() {
  const { access } = useDemoState()

  return (
    profile: { name: string; email: string },
    selection?: PlanSelection,
  ) => {
    access.setRegistrationDraft(profile)
    access.setRegistration({
      ...profile,
      workspace:
        access.onboarding.step === "complete"
          ? ""
          : (access.registration?.workspace ?? ""),
      selection,
    })
  }
}
