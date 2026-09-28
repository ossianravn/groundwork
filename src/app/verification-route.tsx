import { useState } from "react"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { buttonVariants } from "@/kit/ui/button"
import { VerificationForm } from "@/features/auth/verification-form"
import { AccessPage } from "./access-layout"
import { useDemoState } from "./demo-state"

export function VerificationRoute() {
  const { demo } = useDemoState()
  const security = demo.account.security
  const search = useSearch({ from: "/auth/verify" })
  const navigate = useNavigate()
  const [destination, setDestination] = useState<string | null>(null)
  const [navigationFailed, setNavigationFailed] = useState(false)

  if (destination)
    return (
      <AccessPage
        title={
          navigationFailed ? "Verification complete" : "Opening your workspace"
        }
      >
        {navigationFailed ? (
          <a href={destination} className={buttonVariants()}>
            Continue to workspace
          </a>
        ) : (
          <p role="status">Opening…</p>
        )}
      </AccessPage>
    )

  if (!security.challenge || security.challenge.token !== search.token)
    return (
      <AccessPage
        title="Start with sign-in"
        description="There is no active verification attempt. Sign in again if this demo was reloaded or the attempt was already used."
      >
        <Link
          to="/auth/sign-in"
          search={{ returnTo: search.returnTo, token: "" }}
          className={buttonVariants()}
        >
          Sign in
        </Link>
      </AccessPage>
    )

  return (
    <AccessPage
      title="Two-step verification"
      footer={
        <Link
          to="/auth/sign-in"
          search={{ returnTo: security.challenge.returnTo, token: "" }}
          className="access-link"
        >
          Back to sign-in
        </Link>
      }
    >
      <VerificationForm
        allowRecovery
        onVerify={(code, method) => {
          const target = security.verify(search.token, code, method)

          if (!target) return false
          setDestination(target)
          void navigate({ href: target, replace: true }).catch(() =>
            setNavigationFailed(true),
          )

          return true
        }}
      />
    </AccessPage>
  )
}
