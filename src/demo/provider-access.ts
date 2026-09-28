import fixtures from "./data/auth-providers.json"
import type { PlanSelection } from "./billing"

export const providers = fixtures.providers

export const providerRegistrationProfile = fixtures.registrationProfile

export type ProviderId = keyof typeof providers

export type ProviderIntent = "sign-in" | "sign-up"

export interface ProviderRequest {
  provider: ProviderId
  intent: ProviderIntent
  returnTo: string
  selection?: PlanSelection
  profile: { name: string; email: string }
  outcome: "success" | "unavailable"
}

export interface ProviderAttempt extends ProviderRequest {
  token: string
}

export function consumeProviderAttempt(
  current: ProviderAttempt | null,
  token: string,
) {
  if (!current || current.token !== token)
    return { next: current, result: null }

  return { next: null, result: current }
}

export function providerId(value: string): ProviderId | null {
  return value === "google" || value === "github" ? value : null
}
