import { useRef, useState } from "react"

type SignInLink = { email: string; token: string; returnTo: string }

// Local demonstration only; the callback does not authenticate an account.
export function useSignInLink() {
  const [link, setLink] = useState<SignInLink | null>(null)
  const [email, setEmail] = useState("")
  const consumed = useRef<string | null>(null)

  return {
    link,
    email,
    setEmail,
    request: (destinationEmail: string, returnTo: string) => {
      setLink({
        email: destinationEmail.trim(),
        token: crypto.randomUUID(),
        returnTo,
      })
    },
    consume: (token: string) => {
      if (!link || link.token !== token || consumed.current === token)
        return null

      // Claim synchronously: a repeated effect cannot consume a stale render twice.
      consumed.current = token
      setLink(null)

      return link.returnTo
    },
    reset: () => {
      consumed.current = null
      setLink(null)
      setEmail("")
    },
  }
}
