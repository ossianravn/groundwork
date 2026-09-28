import { useState } from "react"
import { useSignInLink } from "./use-sign-in-link"
import { useProviderAccess } from "./use-provider-access"
import {
  initialOnboarding,
  registerForSetup,
  type Registration,
  type InvitationDraft,
} from "./onboarding"

// Demo transitions only. Passwords never cross this boundary.
export function useAccess() {
  const signInLink = useSignInLink()
  const provider = useProviderAccess()
  const [onboarding, setOnboarding] = useState(initialOnboarding)

  const [registrationDraft, setRegistrationDraft] = useState({
    name: "",
    email: "",
  })

  const [recovery, setRecovery] = useState<{
    token: string
    returnTo: string
  } | null>(null)

  function requestReset(returnTo: string) {
    setRecovery({ token: crypto.randomUUID(), returnTo })
  }

  function consumeReset(token: string) {
    if (!recovery || recovery.token !== token) return false
    setRecovery(null)

    return true
  }

  return {
    registrationDraft,
    setRegistrationDraft,
    provider,
    signInLink,
    onboarding,
    registration: onboarding.registration,
    setRegistration: (registration: Registration) =>
      setOnboarding((current) => registerForSetup(current, registration)),
    setWorkspaceName: (workspace: string) =>
      setOnboarding((current) => ({
        ...current,
        registration: current.registration
          ? { ...current.registration, workspace }
          : null,
      })),
    setInvitations: (invitations: InvitationDraft[]) =>
      setOnboarding((current) => ({ ...current, invitations })),
    advanceSetup: (step: "team" | "complete") => {
      setOnboarding((current) => ({ ...current, step }))

      if (step === "complete") setRegistrationDraft({ name: "", email: "" })
    },
    recovery,
    requestReset,
    consumeReset,
    reset: () => {
      provider.reset()
      signInLink.reset()
      setOnboarding(initialOnboarding)
      setRegistrationDraft({ name: "", email: "" })
      setRecovery(null)
    },
  }
}
