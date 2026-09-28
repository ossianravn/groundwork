import { useDemoState } from "./demo-state"
import { accessReturnTo } from "./access-search"

// Every sign-in method hands off here after its first demo step succeeds.
export function useSignInDestination() {
  const { demo } = useDemoState()

  return (returnTo: string) => {
    const destination = accessReturnTo(returnTo)
    const challenge = demo.account.security.beginSignIn(destination)

    return challenge
      ? `/auth/verify?${new URLSearchParams({ token: challenge.token, returnTo: destination })}`
      : destination
  }
}
