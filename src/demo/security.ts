import fixtures from "./data/security.json"

export const demoVerificationCode = "123456"

export type VerificationMethod = "authenticator" | "recovery"

export type SecuritySession = (typeof fixtures.sessions)[number]

export type SecurityEvent = (typeof fixtures.events)[number]

export interface SecurityState {
  enabled: boolean
  recoveryCodes: string[]
  sessions: SecuritySession[]
  events: SecurityEvent[]
  challenge: { token: string; returnTo: string } | null
}

export function initialSecurity(freshAccount = false): SecurityState {
  return {
    enabled: false,
    recoveryCodes: [],
    challenge: null,
    sessions: freshAccount
      ? fixtures.sessions.filter((session) => session.current)
      : fixtures.sessions,
    events: freshAccount ? [] : fixtures.events,
  }
}

export function recordSecurityEvent(
  state: SecurityState,
  label: string,
  at: string,
): SecurityState {
  return {
    ...state,
    events: [
      { id: `${at}-${state.events.length}`, label, at },
      ...state.events,
    ],
  }
}

export function beginSignIn(
  state: SecurityState,
  returnTo: string,
  token: string,
): SecurityState {
  return { ...state, challenge: state.enabled ? { token, returnTo } : null }
}

export function verifySignIn(
  state: SecurityState,
  token: string,
  code: string,
  method: VerificationMethod,
  at: string,
) {
  const normalized = code.trim().toUpperCase()

  const valid =
    method === "authenticator"
      ? normalized === demoVerificationCode
      : state.recoveryCodes.includes(normalized)

  if (
    !state.enabled ||
    !state.challenge ||
    state.challenge.token !== token ||
    !valid
  )
    return { state, destination: null }

  return {
    destination: state.challenge.returnTo,
    state: recordSecurityEvent(
      {
        ...state,
        challenge: null,
        recoveryCodes:
          method === "recovery"
            ? state.recoveryCodes.filter((value) => value !== normalized)
            : state.recoveryCodes,
      },
      method === "recovery"
        ? "Signed in with a recovery code"
        : "Two-step verification completed",
      at,
    ),
  }
}
