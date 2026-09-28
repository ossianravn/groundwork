import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { Button, buttonVariants } from "@/kit/ui/button"
import { providers } from "@/demo/provider-access"
import { AccessPage } from "./access-layout"
import { useDemoState } from "./demo-state"
import { useSignInDestination } from "./use-sign-in-destination"
import { useStartRegistration } from "./use-start-registration"

export function ProviderCallbackRoute() {
  const { access } = useDemoState()
  const search = useSearch({ from: "/auth/provider/callback" })
  const navigate = useNavigate()
  const signInDestination = useSignInDestination()
  const startRegistration = useStartRegistration()
  const processed = useRef(false)
  const [attemptAtEntry] = useState(access.provider.attempt)

  const [failedDestination, setFailedDestination] = useState<string | null>(
    null,
  )

  const consume = access.provider.consume

  useEffect(() => {
    if (processed.current) return
    processed.current = true
    const attempt = consume(search.token)

    if (!attempt || attempt.outcome === "unavailable") return

    let destination: string

    if (attempt.intent === "sign-up") {
      startRegistration(attempt.profile, attempt.selection)
      destination = "/onboarding/workspace"
    } else destination = signInDestination(attempt.returnTo)
    void navigate({ href: destination, replace: true }).catch(() =>
      setFailedDestination(destination),
    )
  }, [consume, navigate, search.token, signInDestination, startRegistration])

  if (!attemptAtEntry || attemptAtEntry.token !== search.token)
    return (
      <AccessPage
        title="This attempt is unavailable"
        description="Start again if the attempt was used, replaced or this demo reloaded."
      >
        <Link
          to={search.intent === "sign-up" ? "/auth/sign-up" : "/auth/sign-in"}
          search={{ ...search, token: "" }}
          className={buttonVariants()}
        >
          Choose another method
        </Link>
      </AccessPage>
    )

  if (failedDestination)
    return (
      <AccessPage title="Could not open the next page">
        <Button
          onClick={() => {
            void navigate({ href: failedDestination, replace: true }).catch(
              () => setFailedDestination(failedDestination),
            )
          }}
        >
          Try again
        </Button>
      </AccessPage>
    )

  if (attemptAtEntry.outcome === "unavailable") {
    const attempt = attemptAtEntry

    const origin =
      attempt.intent === "sign-up" ? "/auth/sign-up" : "/auth/sign-in"

    const context = {
      returnTo: attempt.returnTo,
      token: "",
      ...attempt.selection,
    }

    return (
      <AccessPage
        title={`${providers[attempt.provider].name} is unavailable`}
        description="This demo attempt could not finish. Try again or choose another method."
        footer={
          <Link to={origin} search={context} className="access-link">
            Use another method
          </Link>
        }
      >
        <Link
          to="/auth/provider/$provider"
          params={{ provider: attempt.provider }}
          search={{ ...context, intent: attempt.intent, scenario: "normal" }}
          className={buttonVariants()}
        >
          Try again
        </Link>
      </AccessPage>
    )
  }

  return (
    <AccessPage title="Continuing">
      <p role="status">Opening…</p>
    </AccessPage>
  )
}
