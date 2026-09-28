import { useCallback, useReducer } from "react"
import { inboxReducer, inboxState, type InboxScenario } from "./inbox"

export { inboxMessages } from "./inbox"

export type {
  InboxEntry,
  InboxMessage,
  InboxFilter,
  InboxScenario,
} from "./inbox"

export function useInbox() {
  const [state, dispatch] = useReducer(inboxReducer, undefined, () =>
    inboxState(),
  )

  const acknowledgeCreated = useCallback(
    () => dispatch({ type: "created" }),
    [],
  )

  return {
    ...state,
    dispatch,
    acknowledgeCreated,
    unreadCount: state.entries.filter((entry) => !entry.read).length,
    setRead(ids: string[], read: boolean, scenario: InboxScenario) {
      dispatch({ type: "read", ids, read, scenario })
    },
    clearFailure() {
      dispatch({ type: "clear-failure" })
    },
    reset() {
      dispatch({ type: "reset" })
    },
    clear() {
      dispatch({ type: "clear" })
    },
  }
}
