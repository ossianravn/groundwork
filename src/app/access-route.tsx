import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { SignInForm, SignUpForm } from "@/features/auth/access-forms"
import { buttonVariants } from "@/kit/ui/button"
import { useDemoState } from "./demo-state"
import { AccessPage } from "./access-layout"
import { useSignInDestination } from "./use-sign-in-destination"
import { useStartRegistration } from "./use-start-registration"
import { ProviderButtons } from "@/features/auth/provider-buttons"
import { RegistrationPlan } from "./registration-plan"
import type { PlanSelection } from "@/demo/billing"

export function SignInRoute() {
  const signInDestination = useSignInDestination()
  const { demo } = useDemoState()
  const navigate = useNavigate()
  const search = useSearch({ from: "/auth/sign-in" })

  return (
    <AccessPage
      title="Welcome back"
      description="Choose a method to enter the demo."
      footer={
        <p>
          New to forma?{" "}
          <Link
            to="/auth/sign-up"
            search={search}
            className="access-link font-medium"
          >
            Create an account
          </Link>
        </p>
      }
    >
      <ProviderButtons
        onChoose={(provider) =>
          void navigate({
            to: "/auth/provider/$provider",
            params: { provider },
            search: { ...search, intent: "sign-in", scenario: "normal" },
          })
        }
      />
      <SignInForm
        email={demo.account.email}
        recoveryLink={
          <Link
            to="/auth/forgot-password"
            search={search}
            className="access-link text-xs"
          >
            Forgot password?
          </Link>
        }
        onSubmit={() =>
          void navigate({ href: signInDestination(search.returnTo) })
        }
      />
      <Link
        to="/auth/magic-link"
        search={search}
        className={buttonVariants({
          variant: "outline",
          className: "access-alternative",
        })}
      >
        Sign in with an email link
      </Link>
    </AccessPage>
  )
}

export function SignUpRoute() {
  const startRegistration = useStartRegistration()
  const { access } = useDemoState()
  const navigate = useNavigate()
  const search = useSearch({ from: "/auth/sign-up" })

  const selection: PlanSelection | undefined = search.plan
    ? { plan: search.plan, billing: search.billing ?? "monthly" }
    : undefined

  return (
    <AccessPage
      title="Create your account"
      description={<RegistrationPlan selection={selection} />}
      footer={
        <p>
          Already have an account?{" "}
          <Link
            to="/auth/sign-in"
            search={search}
            className="access-link font-medium"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <ProviderButtons
        onChoose={(provider) =>
          void navigate({
            to: "/auth/provider/$provider",
            params: { provider },
            search: { ...search, intent: "sign-up", scenario: "normal" },
          })
        }
      />
      <SignUpForm
        initial={access.registrationDraft}
        onChange={access.setRegistrationDraft}
        onSubmit={(profile) => {
          startRegistration(profile, selection)
          void navigate({ to: "/onboarding/workspace" })
        }}
      />
    </AccessPage>
  )
}
