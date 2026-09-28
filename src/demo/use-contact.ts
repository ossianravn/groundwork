import { useState } from "react"

export interface ContactValues {
  name: string
  email: string
  subject: string
  message: string
}

export type ContactState =
  | { status: "editing" | "failed"; values: ContactValues }
  | { status: "complete" }

const initial: ContactState = {
  status: "editing",
  values: { name: "", email: "", subject: "", message: "" },
}

export type ContactScenario = "normal" | "contact-failure"

export function useContact() {
  const [state, setState] = useState<ContactState>(initial)

  return {
    state,
    update: (field: keyof ContactValues, value: string) => {
      setState((current) =>
        current.status === "complete"
          ? current
          : {
              ...current,
              values: { ...current.values, [field]: value },
            },
      )
    },
    submit: (scenario: ContactScenario) => {
      setState((current) => {
        if (current.status === "complete") return current

        if (scenario === "contact-failure" && current.status === "editing") {
          return { ...current, status: "failed" }
        }

        // This local result never sends or persists the entered message.
        return { status: "complete" }
      })
    },
    reset: () => setState(initial),
  }
}
