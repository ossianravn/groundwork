import { useState } from "react"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { RecoveryForm, ResetPasswordForm } from "@/features/auth/access-forms"
import { buttonVariants } from "@/kit/ui/button"
import { AccessPage } from "./access-layout"
import { useDemoState } from "./demo-state"

export function ForgotPasswordRoute() {
  const { access } = useDemoState()
  const navigate = useNavigate()
  const search = useSearch({ from: "/auth/forgot-password" })

  return (
    <AccessPage
      title="Forgot password?"
      description="Enter your email to request a reset link."
      footer={
        <Link to="/auth/sign-in" search={search} className="access-link">
          Back to sign in
        </Link>
      }
    >
      <RecoveryForm
        onSubmit={() => {
          access.requestReset(search.returnTo)
          void navigate({
            to: "/auth/check-email",
            search: { ...search, token: "", purpose: "recovery" },
          })
        }}
      />
    </AccessPage>
  )
}

export function CheckEmailRoute() {
  const { access } = useDemoState()
  const search = useSearch({ from: "/auth/check-email" })

  if (!access.recovery) return <UnavailableLink search={search} />

  return (
    <AccessPage
      title="Reset link requested"
      description="In a connected app, an account matching that email would receive a reset link."
      footer={
        <Link
          to="/auth/forgot-password"
          search={search}
          className="access-link"
        >
          Use another email
        </Link>
      }
    >
      <div className="access-stack">
        <p className="text-muted-foreground">
          No email is sent in this demo. Continue below to try resetting a
          password.
        </p>
        <Link
          to="/auth/reset-password"
          search={{
            returnTo: access.recovery.returnTo,
            token: access.recovery.token,
          }}
          className={buttonVariants()}
        >
          Open demo reset link
        </Link>
      </div>
    </AccessPage>
  )
}

function UnavailableLink({
  search,
}: {
  search: { returnTo: string; token: string }
}) {
  return (
    <AccessPage
      title="This link is no longer available"
      description="Reset links work once and expire when this demo reloads."
    >
      <Link
        to="/auth/forgot-password"
        search={{ ...search, token: "" }}
        className={buttonVariants()}
      >
        Request a new link
      </Link>
    </AccessPage>
  )
}

export function ResetPasswordRoute() {
  const { access } = useDemoState()
  const search = useSearch({ from: "/auth/reset-password" })
  const [complete, setComplete] = useState(false)

  if (complete)
    return (
      <AccessPage
        title="Password reset complete"
        description="The demo reset is complete. No password was stored or changed."
      >
        <Link
          to="/auth/sign-in"
          search={{ ...search, token: "" }}
          className={buttonVariants()}
        >
          Back to sign in
        </Link>
      </AccessPage>
    )

  if (!access.recovery || access.recovery.token !== search.token)
    return <UnavailableLink search={search} />

  return (
    <AccessPage
      title="Choose a new password"
      description="Use a sample password for this demo."
    >
      <ResetPasswordForm
        onSubmit={() => setComplete(access.consumeReset(search.token))}
      />
    </AccessPage>
  )
}
