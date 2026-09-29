import { Link, Navigate, useNavigate } from "@tanstack/react-router"
import { buttonVariants } from "@/kit/ui/button"
import { WorkspaceSetupForm } from "@/features/auth/access-forms"
import { SetupProgress } from "@/features/auth/setup-progress"
import { SetupInvitations } from "@/features/auth/setup-invitations"
import { SetupComplete } from "@/features/auth/setup-complete"
import { useDemoState } from "./demo-state"
import { AccessPage } from "./access-layout"
import { RegistrationPlan } from "./registration-plan"
import { accessReturnTo } from "./access-search"
import { defaultProjectsSearch } from "./projects-search"

function MissingSetup() {
  return (
    <AccessPage
      title="Create an account first"
      description="Add your details before setting up a workspace."
    >
      <Link
        to="/auth/sign-up"
        search={{ returnTo: accessReturnTo(""), token: "" }}
        className={buttonVariants()}
      >
        Create an account
      </Link>
    </AccessPage>
  )
}

export function OnboardingEntryRoute() {
  const { access } = useDemoState()

  if (access.onboarding.step === "complete")
    return <Navigate to="/onboarding/complete" replace />

  if (access.onboarding.step === "team")
    return <Navigate to="/onboarding/team" replace />

  return <Navigate to="/onboarding/workspace" replace />
}

export function WorkspaceSetupRoute() {
  const { access } = useDemoState()
  const navigate = useNavigate()
  const registration = access.registration

  if (!registration) return <MissingSetup />

  if (access.onboarding.step === "complete")
    return <Navigate to="/onboarding/complete" replace />

  return (
    <AccessPage
      title="Name your workspace"
      description={<RegistrationPlan selection={registration.selection} />}
      progress={<SetupProgress step={1} />}
      footer={
        <Link
          to="/auth/sign-up"
          search={{
            returnTo: accessReturnTo(""),
            token: "",
            ...registration.selection,
          }}
          className="access-link"
        >
          Back to your details
        </Link>
      }
    >
      <WorkspaceSetupForm
        name={registration.workspace}
        onChange={access.setWorkspaceName}
        onSubmit={() => {
          access.advanceSetup("team")
          void navigate({ to: "/onboarding/team" })
        }}
      />
    </AccessPage>
  )
}

export function TeamSetupRoute() {
  const { access, demo, drafts, results, files } = useDemoState()
  const navigate = useNavigate()
  const registration = access.registration

  if (!registration) return <MissingSetup />

  if (access.onboarding.step === "complete")
    return <Navigate to="/onboarding/complete" replace />

  if (!registration.workspace.trim())
    return <Navigate to="/onboarding/workspace" replace />

  return (
    <AccessPage
      title="Invite your team"
      description="Optional. Add colleagues now or invite them from Team settings later."
      width="wide"
      progress={<SetupProgress step={2} />}
      footer={
        <Link to="/onboarding/workspace" className="access-link">
          Back to workspace
        </Link>
      }
    >
      <SetupInvitations
        rows={access.onboarding.invitations}
        accountEmail={registration.email}
        onChange={access.setInvitations}
        onFinish={(invitations) => {
          demo.startWorkspace(
            registration.workspace.trim(),
            registration,
            invitations,
          )
          drafts.reset()
          files.clear()
          results.reset()
          access.advanceSetup("complete")
          void navigate({ to: "/onboarding/complete" })
        }}
      />
    </AccessPage>
  )
}

export function SetupCompleteRoute() {
  const { access, demo } = useDemoState()

  if (!access.registration) return <MissingSetup />

  if (access.onboarding.step !== "complete") return <OnboardingEntryRoute />

  return (
    <AccessPage
      title="Your workspace is ready"
      progress={<SetupProgress step={3} />}
    >
      <SetupComplete
        name={demo.workspace.name}
        owner={demo.account.profile.name}
        plan={demo.workspace.subscription ? demo.workspace.plan : ""}
        invitations={demo.invitations}
        openLink={
          <Link
            to="/app/demo/projects"
            search={defaultProjectsSearch}
            className={buttonVariants()}
          >
            Open workspace
          </Link>
        }
        teamLink={
          <Link to="/app/demo/settings/team" className="access-link">
            Manage team
          </Link>
        }
      />
    </AccessPage>
  )
}
