import { Link, useNavigate, useParams, useSearch } from "@tanstack/react-router"
import { buttonVariants } from "@/kit/ui/button"
import { ProviderContinuation } from "@/features/auth/provider-continuation"
import {
  providerId,
  providers,
  providerRegistrationProfile,
} from "@/demo/provider-access"
import { AccessPage } from "./access-layout"
import { useDemoState } from "./demo-state"

export function ProviderRoute() {
  const { provider: value } = useParams({ from: "/auth/provider/$provider" })
  const search = useSearch({ from: "/auth/provider/$provider" })
  const { access, demo } = useDemoState()
  const navigate = useNavigate()
  const provider = providerId(value)
  const origin = search.intent === "sign-up" ? "/auth/sign-up" : "/auth/sign-in"

  if (!provider)
    return (
      <AccessPage title="Provider not available">
        <Link to={origin} search={search} className={buttonVariants()}>
          Choose another method
        </Link>
      </AccessPage>
    )

  const profile =
    search.intent === "sign-in"
      ? { name: demo.account.profile.name, email: demo.account.email }
      : providerRegistrationProfile

  return (
    <AccessPage
      title={`Continue with ${providers[provider].name}`}
      description={`Local ${providers[provider].name} demo. No provider connection or data sharing.`}
      footer={
        <Link to={origin} search={search} className="access-link">
          Cancel
        </Link>
      }
    >
      <ProviderContinuation
        profile={profile}
        onContinue={() => {
          const token = access.provider.begin({
            provider,
            profile,
            intent: search.intent,
            returnTo: search.returnTo,
            selection: search.plan
              ? { plan: search.plan, billing: search.billing ?? "monthly" }
              : undefined,
            outcome:
              search.scenario === "provider-unavailable"
                ? "unavailable"
                : "success",
          })

          void navigate({
            to: "/auth/provider/callback",
            search: { ...search, token },
          })
        }}
      />
    </AccessPage>
  )
}
