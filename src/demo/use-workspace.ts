import { nextProjectColor } from "./project-colors"
import { useState } from "react"
import type { PlanSelection } from "./billing"
import { initialProjects } from "./project-fixtures"
import { textDocument } from "@/kit/rich-text/document"
import { initialActivity as activityData } from "./activity-fixtures"
import workspaceData from "./data/workspace.json"
import { useAccount } from "./use-account"
import { useIntegrations } from "./use-integrations"
import { useInbox } from "./use-inbox"
import { useWorkspaceIdentity } from "./use-workspace-identity"
import {
  changeMember,
  initialMemberships,
  initialInvitations,
  invitationError,
  type MemberChange,
  type TeamRole,
  type TeamResult,
} from "./team"
import type { Activity, NewProject } from "./model"
import {
  validateProjectValues,
  type ProjectValues,
  type ProjectTarget,
  type ProjectSaveScenario,
  type ProjectSaveResult,
} from "./project-form"
import { applyProjectSave } from "./project-save"
import scenarios from "./data/scenarios.json"
import { applyProjectBulkChange, type ProjectBulkAction } from "./project-bulk"

export function useWorkspace() {
  const account = useAccount()
  const inbox = useInbox()
  const integrations = useIntegrations()
  const identity = useWorkspaceIdentity(account.profile)

  const [saveNotice, setSaveNotice] = useState<{
    projectId: string
    message: string
  } | null>(null)

  const [state, setState] = useState({
    projects: initialProjects,
    activity: activityData,
    memberships: initialMemberships,
    invitations: initialInvitations,
    resetDone: false,
  })

  const memberships = state.memberships.map((member) =>
    member.memberId === workspaceData.currentUserId
      ? { ...member, email: account.email }
      : member,
  )

  const workspace = {
    ...identity.workspace,
    people: identity.workspace.members,
    members: identity.workspace.members.filter((member) =>
      memberships.some((item) => item.memberId === member.id && item.active),
    ),
  }

  function updateMember(memberId: string, change: MemberChange): TeamResult {
    const next = changeMember(state, memberId, change)

    if (next.result.ok)
      setState({ ...state, ...next.records, resetDone: false })

    return next.result
  }

  function inviteMember(email: string, role: TeamRole): TeamResult {
    const message = invitationError(email, memberships, state.invitations)

    if (message) return { ok: false, message }

    const invitation = {
      id: crypto.randomUUID(),
      email: email.trim().toLowerCase(),
      role,
    }

    setState((current) => ({
      ...current,
      invitations: [...current.invitations, invitation],
      resetDone: false,
    }))

    return { ok: true }
  }

  function createProject(input: NewProject) {
    const result = saveProject(
      { kind: "create" },
      {
        ...input,
        description: textDocument(input.description.trim()),
        ownerId: workspace.currentUserId,
        color: nextProjectColor(state.projects.length),
        tags: [],
        links: [],
      },
      "normal",
    )

    if (result.kind !== "saved")
      throw new Error("Quick-create requires valid project fields")

    return result.projectId
  }

  function completeProject(id: string) {
    setSaveNotice(null)
    const project = state.projects.find((item) => item.id === id)

    if (!project || project.status === "completed") return

    const event: Activity = {
      id: crypto.randomUUID(),
      projectId: id,
      memberId: workspace.currentUserId,
      date: workspace.referenceDate,
      action: "finished",
      tasksCompleted: project.tasks - project.completedTasks,
      kind: "status",
      changes: [
        { field: "status", before: project.status, after: "completed" },
        ...(project.tasks !== project.completedTasks
          ? [
              {
                field: "completedTasks" as const,
                before: project.completedTasks,
                after: project.tasks,
              },
            ]
          : []),
      ],
    }

    setState((current) => ({
      ...current,
      projects: current.projects.map((item) =>
        item.id === id
          ? { ...item, status: "completed", completedTasks: item.tasks }
          : item,
      ),
      activity: [...current.activity, event],
      resetDone: false,
    }))
  }

  function reset() {
    account.reset()
    inbox.reset()
    integrations.reset()
    identity.reset()
    setSaveNotice(null)
    setState({
      projects: initialProjects,
      activity: activityData,
      memberships: initialMemberships,
      invitations: initialInvitations,
      resetDone: true,
    })
  }

  function bulkChangeProjects(
    ids: string[],
    action: ProjectBulkAction,
    failPartially = false,
  ) {
    const { records, result } = applyProjectBulkChange(state, ids, action, {
      members: workspace.members,
      memberId: workspace.currentUserId,
      date: workspace.referenceDate,
      eventId: () => crypto.randomUUID(),
      rejectedIds: failPartially
        ? scenarios["bulk-partial-failure"].projectIds
        : [],
    })

    setSaveNotice(null)
    setState({ ...state, ...records, resetDone: false })

    return result
  }

  function saveProject(
    target: ProjectTarget,
    values: ProjectValues,
    scenario: ProjectSaveScenario,
    showNotice = true,
  ): ProjectSaveResult {
    const errors = validateProjectValues(values, workspace.members)

    if (Object.values(errors).some(Boolean)) return { kind: "invalid", errors }

    if (
      target.kind === "edit" &&
      !state.projects.some((project) => project.id === target.id)
    ) {
      return {
        kind: "rejected",
        message:
          "This project is no longer available. Return to projects to continue.",
      }
    }

    if (scenario === "save-failure")
      return { kind: "rejected", message: scenarios[scenario].message }

    const event = {
      projectId: target.kind === "edit" ? target.id : crypto.randomUUID(),
      eventId: crypto.randomUUID(),
      memberId: workspace.currentUserId,
      date: workspace.referenceDate,
    }

    setState((current) => ({
      ...current,
      ...applyProjectSave(current, target, values, event),
      resetDone: false,
    }))
    setSaveNotice(
      showNotice
        ? {
            projectId: event.projectId,
            message:
              target.kind === "create" ? "Project created." : "Changes saved.",
          }
        : null,
    )

    return { kind: "saved", projectId: event.projectId }
  }

  return {
    ...state,
    account,
    inbox,
    integrations,
    workspace,
    identity,
    memberships,
    updateMember,
    inviteMember,
    revokeInvitation: (id: string) =>
      setState((current) => ({
        ...current,
        invitations: current.invitations.filter(
          (invitation) => invitation.id !== id,
        ),
        resetDone: false,
      })),
    startWorkspace: (
      name: string,
      profile: { name: string; email: string; selection?: PlanSelection },
      invitations: typeof state.invitations = [],
    ) => {
      account.startAccount(profile.name, profile.email)
      inbox.clear()
      integrations.clear()
      identity.start(name, profile.name, profile.selection)
      setSaveNotice(null)
      setState({
        projects: [],
        activity: [],
        invitations,
        memberships: [
          {
            memberId: workspaceData.currentUserId,
            email: profile.email,
            role: "owner",
            active: true,
          },
        ],
        resetDone: false,
      })
    },
    createProject,
    completeProject,
    bulkChangeProjects,
    reset,
    saveProject,
    saveNotice,
  }
}
