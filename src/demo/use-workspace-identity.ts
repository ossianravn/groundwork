import { useState } from "react"
import workspaceData from "./data/workspace.json"
import { profileInitials, type AccountProfile } from "./use-account"
import {
  getPlan,
  sampleSubscription,
  sampleInvoices,
  type Invoice,
  type PlanSelection,
} from "./billing"

export type WorkspaceIdentity = { name: string; logo: string }

const initial: typeof workspaceData & {
  logo: string
  subscription?: PlanSelection
  invoices: Invoice[]
} = {
  ...workspaceData,
  plan: getPlan(sampleSubscription.plan).name,
  logo: "",
  subscription: sampleSubscription,
  invoices: sampleInvoices,
}

export function useWorkspaceIdentity(profile: AccountProfile) {
  const [identity, setIdentity] = useState(initial)
  const [draft, setDraft] = useState<WorkspaceIdentity>(initial)
  const [revision, setRevision] = useState(0)

  const workspace = {
    ...identity,
    members: identity.members.map((member) =>
      member.id === identity.currentUserId
        ? {
            ...member,
            name: profile.name,
            initials: profileInitials(profile.name),
            avatar: profile.avatar,
          }
        : member,
    ),
  }

  function replace(next: typeof initial) {
    setIdentity(next)
    setDraft(next)
    setRevision((current) => current + 1)
  }

  return {
    workspace,
    draft,
    setDraft,
    revision,
    dirty: draft.name !== identity.name || draft.logo !== identity.logo,
    save: () => {
      if (!draft.name.trim()) return false
      const next = { ...identity, name: draft.name.trim(), logo: draft.logo }
      setIdentity(next)
      setDraft(next)

      return true
    },
    cancel: () => {
      setDraft(identity)
      setRevision((current) => current + 1)
    },
    reset: () => replace(initial),
    changePlan: (subscription: PlanSelection) => {
      setIdentity((current) => ({
        ...current,
        subscription,
        plan: getPlan(subscription.plan).name,
      }))
    },
    start: (name: string, memberName: string, subscription?: PlanSelection) =>
      replace({
        ...initial,
        name,
        plan: subscription ? getPlan(subscription.plan).name : "Workspace",
        subscription,
        invoices: [],
        members: [
          {
            id: initial.currentUserId,
            name: memberName,
            initials: profileInitials(memberName),
          },
        ],
      }),
  }
}
