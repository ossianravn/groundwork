import { useRef, useState } from "react"
import {
  beginSignIn,
  demoVerificationCode,
  initialSecurity,
  recordSecurityEvent,
  verifySignIn,
  type SecurityState,
  type VerificationMethod,
} from "./security"

function newRecoveryCodes() {
  return Array.from({ length: 6 }, () => {
    const value = crypto.randomUUID().slice(0, 8).toUpperCase()

    return `${value.slice(0, 4)}-${value.slice(4)}`
  })
}

export function useSecurity() {
  const [state, setState] = useState(initialSecurity)
  const current = useRef(state)

  function commit(next: SecurityState) {
    current.current = next
    setState(next)
  }

  function record(next: SecurityState, label: string) {
    commit(recordSecurityEvent(next, label, new Date().toISOString()))
  }

  return {
    ...state,
    enable: (code: string) => {
      if (code !== demoVerificationCode) return false
      record(
        {
          ...current.current,
          enabled: true,
          recoveryCodes: newRecoveryCodes(),
          challenge: null,
        },
        "Two-step verification enabled",
      )

      return true
    },
    disable: () =>
      record(
        {
          ...current.current,
          enabled: false,
          recoveryCodes: [],
          challenge: null,
        },
        "Two-step verification disabled",
      ),
    replaceCodes: () =>
      record(
        { ...current.current, recoveryCodes: newRecoveryCodes() },
        "Recovery codes replaced",
      ),
    revokeSession: (id: string) => {
      const session = current.current.sessions.find((item) => item.id === id)

      if (!session || session.current || session.revoked) return
      record(
        {
          ...current.current,
          sessions: current.current.sessions.map((item) =>
            item.id === id ? { ...item, revoked: true } : item,
          ),
        },
        `Session revoked: ${session.device}`,
      )
    },
    beginSignIn: (returnTo: string) => {
      const next = beginSignIn(current.current, returnTo, crypto.randomUUID())
      commit(next)

      return next.challenge
    },
    verify: (token: string, code: string, method: VerificationMethod) => {
      const result = verifySignIn(
        current.current,
        token,
        code,
        method,
        new Date().toISOString(),
      )

      if (result.destination) commit(result.state)

      return result.destination
    },
    reset: (freshAccount = false) => commit(initialSecurity(freshAccount)),
  }
}
