import { useRef, useState } from "react"
import {
  consumeProviderAttempt,
  type ProviderAttempt,
  type ProviderRequest,
} from "./provider-access"

// The continuation route consumes a local request, never a provider credential.
export function useProviderAccess() {
  const pending = useRef<ProviderAttempt | null>(null)
  const [attempt, setAttempt] = useState<ProviderAttempt | null>(null)

  return {
    attempt,
    begin: (request: ProviderRequest) => {
      const token = crypto.randomUUID()
      pending.current = { ...request, token }
      setAttempt(pending.current)

      return token
    },
    consume: (token: string) => {
      const { next, result } = consumeProviderAttempt(pending.current, token)
      pending.current = next
      setAttempt(next)

      return result
    },
    reset: () => {
      pending.current = null
      setAttempt(null)
    },
  }
}
