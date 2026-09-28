import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { Button, buttonVariants } from "@/kit/ui/button"
import { EmailLinkForm } from "@/features/auth/email-link-form"
import { AccessPage } from "./access-layout"
import { useDemoState } from "./demo-state"
import { CheckEmailRoute } from "./recovery-route"
import { useSignInDestination } from "./use-sign-in-destination"

export function MagicLinkRoute() {
  const { access } = useDemoState()
  const navigate = useNavigate()
  const search = useSearch({ from: "/auth/magic-link" })
  const session = access.signInLink

  return (
    <AccessPage
      title="Sign in with email"
      description="Request a sign-in link instead of using a password."
      footer={
        <Link to="/auth/sign-in" search={search} className="access-link">
          Use a password
        </Link>
      }
    >
      <EmailLinkForm
        email={session.email}
        onChange={session.setEmail}
        onSubmit={() => {
          session.request(session.email, search.returnTo)
          void navigate({
            to: "/auth/check-email",
            search: { ...search, purpose: "sign-in", token: "" },
          })
        }}
      />
    </AccessPage>
  )
}

export function EmailReceiptRoute() {
  const search = useSearch({ from: "/auth/check-email" })

  return search.purpose === "sign-in" ? <SignInReceipt /> : <CheckEmailRoute />
}

function SignInReceipt() {
  const { access } = useDemoState()
  const search = useSearch({ from: "/auth/check-email" })
  const [renewed, setRenewed] = useState(false)
  const session = access.signInLink
  const link = session.link

  if (!link) return <UnavailableSignInLink returnTo={search.returnTo} />

  return (
    <AccessPage
      title="Sign-in link requested"
      description={
        <>
          For <span className="access-email">{link.email}</span>
        </>
      }
      footer={
        <Link
          to="/auth/magic-link"
          search={{ returnTo: link.returnTo, token: "" }}
          className="access-link"
        >
          Use another email
        </Link>
      }
    >
      <div className="access-stack">
        <Link
          to="/auth/callback"
          search={{ token: link.token, returnTo: link.returnTo }}
          className={buttonVariants()}
        >
          Open demo sign-in link
        </Link>
        <Button
          variant="ghost"
          onClick={() => {
            session.request(link.email, link.returnTo)
            setRenewed(true)
          }}
        >
          {renewed ? "New link ready" : "Request another link"}
        </Button>
        <span role="status" className="sr-only">
          {renewed
            ? "A new demo sign-in link is ready. The previous link no longer works."
            : ""}
        </span>
      </div>
    </AccessPage>
  )
}

function UnavailableSignInLink({ returnTo }: { returnTo: string }) {
  return (
    <AccessPage
      title="This sign-in link is unavailable"
      description="Links work once. Request a new one if it was used, replaced, or this demo reloaded."
    >
      <Link
        to="/auth/magic-link"
        search={{ returnTo, token: "" }}
        className={buttonVariants()}
      >
        Request a new link
      </Link>
    </AccessPage>
  )
}

export function SignInCallbackRoute() {
  const signInDestination = useSignInDestination()
  const { access } = useDemoState()
  const search = useSearch({ from: "/auth/callback" })
  const navigate = useNavigate()
  const attempted = useRef(false)
  const [linkAtEntry] = useState(access.signInLink.link)
  const [error, setError] = useState(false)
  const consume = access.signInLink.consume

  useEffect(() => {
    if (attempted.current) return
    attempted.current = true
    const destination = consume(search.token)

    if (destination)
      void navigate({
        href: signInDestination(destination),
        replace: true,
      }).catch(() => setError(true))
  }, [consume, navigate, search.token, signInDestination])

  if (error)
    return (
      <AccessPage
        title="Could not open the workspace"
        description="Your link was processed. You can open the demo directly."
      >
        <Link
          to="/app/demo/overview"
          search={{ period: 14 }}
          className={buttonVariants()}
        >
          Open demo
        </Link>
      </AccessPage>
    )

  if (!linkAtEntry || linkAtEntry.token !== search.token)
    return <UnavailableSignInLink returnTo={search.returnTo} />

  return (
    <AccessPage title="Opening your workspace">
      <p role="status">Opening…</p>
    </AccessPage>
  )
}
