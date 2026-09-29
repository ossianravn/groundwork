import { RichText } from "@/kit/rich-text/rich-text"
import { useRef, useState } from "react"
import { ArrowLeft, Check, RefreshCw, WifiOff, LogIn } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Card } from "@/kit/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/kit/ui/alert"
import { ProjectForm } from "@/features/projects/project-form"
import { ProjectResources } from "@/features/projects/project-resources"
import { useWorkspace } from "@/demo/use-workspace"
import {
  projectValues,
  projectValuesChanged,
  type ProjectFieldErrors,
  type ProjectSaveResult,
} from "@/demo/project-form"
import scenarios from "@/demo/data/scenarios.json"
import type { StateScenario } from "./state-catalog"
import { StateSessionDialog } from "./state-session-dialog"

const notices = {
  offline: {
    title: "You’re offline",
    description: "Keep editing. Reconnect before saving.",
    action: "Reconnect",
    Icon: WifiOff,
  },
  reconnecting: {
    title: "Reconnecting…",
    description:
      "Your draft is still here. Saving will be available once the connection returns.",
    action: "",
    Icon: RefreshCw,
  },
  "session-expired": {
    title: "Your session expired",
    description: "Sign in to save your changes. Your draft is still here.",
    action: "Sign in",
    Icon: LogIn,
  },
  "update-available": {
    title: "An update is available",
    description: "Your current draft will be kept.",
    action: "Update now",
    Icon: RefreshCw,
  },
}

export function StateEditor({ scenario }: { scenario: StateScenario }) {
  const demo = useWorkspace()
  const project = demo.projects.find((item) => item.id === "brand")

  if (!project)
    throw new Error("State gallery requires the Brand refresh fixture")
  const saved = projectValues(project)
  const projectId = project.id

  const [values, setValues] = useState({
    ...saved,
    name: "Brand refresh — autumn launch",
  })

  const [errors, setErrors] = useState<ProjectFieldErrors>({})

  const [failure, setFailure] = useState(
    scenario === "save-failed" ? scenarios["save-failure"].message : "",
  )

  const [resolved, setResolved] = useState(false)
  const [editing, setEditing] = useState(true)
  const [signIn, setSignIn] = useState(false)
  const [feedback, setFeedback] = useState("")
  const heading = useRef<HTMLHeadingElement>(null)
  const dirty = projectValuesChanged(values, saved)

  const notice =
    scenario === "offline" ||
    scenario === "reconnecting" ||
    scenario === "session-expired" ||
    scenario === "update-available"
      ? notices[scenario]
      : null

  const blocked =
    !resolved &&
    (scenario === "offline" ||
      scenario === "reconnecting" ||
      scenario === "session-expired")

  function recover() {
    setResolved(true)
    setFailure("")
    setSignIn(false)
    setFeedback(
      scenario === "update-available"
        ? "Version 2 applied. Draft retained."
        : scenario === "session-expired"
          ? "Session restored."
          : "Connected.",
    )
    requestAnimationFrame(() =>
      document.getElementById("edit-project-name")?.focus(),
    )
  }

  function leave() {
    setEditing(false)
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }))
  }

  async function save(): Promise<ProjectSaveResult> {
    // Stands in for a slow request; see EDGE-07.
    if (scenario === "slow-save")
      await new Promise((resolve) => setTimeout(resolve, 1500))

    const result: ProjectSaveResult = blocked
      ? {
          kind: "rejected",
          message:
            scenario === "session-expired"
              ? "Sign in before saving. Your draft is still here."
              : "No connection. Your draft is still here. Reconnect to save.",
        }
      : demo.saveProject({ kind: "edit", id: projectId }, values, "normal")

    setErrors(result.kind === "invalid" ? result.errors : {})
    setFailure(result.kind === "rejected" ? result.message : "")

    if (result.kind === "saved") {
      setValues({
        ...values,
        name: values.name.trim(),
      })
      setFeedback("Changes saved.")
    }

    return result
  }

  return (
    <>
      {scenario === "reconnecting" && (
        <div className="state-simulation-control">
          <span>Connection simulation</span>
          <Button
            variant="outline"
            size="sm"
            disabled={resolved}
            onClick={recover}
          >
            {resolved ? "Connected" : "Restore connection"}
          </Button>
        </div>
      )}
      <div className="state-editor">
        <header className="state-editor-heading">
          <h3 ref={heading} tabIndex={-1}>
            {editing ? "Edit project" : project.name}
          </h3>
          {editing ? (
            <Button variant="ghost" size="sm" onClick={leave}>
              <ArrowLeft />
              Leave editor
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditing(true)
                requestAnimationFrame(() =>
                  document.getElementById("edit-project-name")?.focus(),
                )
              }}
            >
              {dirty ? "Resume editing" : "Edit project"}
            </Button>
          )}
        </header>
        {editing ? (
          <>
            {notice && !resolved && (
              <Alert role="status" className="state-notice">
                <notice.Icon />
                <AlertTitle>{notice.title}</AlertTitle>
                <AlertDescription>
                  <p>{notice.description}</p>
                  {notice.action && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        scenario === "session-expired"
                          ? setSignIn(true)
                          : recover()
                      }
                    >
                      {notice.action}
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}
            <Card className="project-editor-card">
              <ProjectForm
                tagOptions={demo.projects.flatMap((item) => item.tags)}
                values={values}
                members={demo.workspace.members}
                errors={errors}
                failure={failure}
                dirty={dirty}
                creating={false}
                onSave={save}
                onCancel={() => {
                  setValues(saved)
                  setErrors({})
                  setFailure("")
                  setFeedback("Draft discarded.")
                  leave()
                }}
                onChange={(field, value) => {
                  setValues((current) => ({ ...current, [field]: value }))
                  setErrors((current) => ({ ...current, [field]: undefined }))
                  setFeedback("")
                }}
              />
            </Card>
          </>
        ) : (
          <Card className="state-project-summary">
            <RichText value={project.description} />
            <dl>
              <div>
                <dt>Owner</dt>
                <dd>
                  {
                    demo.workspace.members.find(
                      (member) => member.id === project.ownerId,
                    )?.name
                  }
                </dd>
              </div>
              <div>
                <dt>Due date</dt>
                <dd>{project.dueDate}</dd>
              </div>
            </dl>
            <ProjectResources project={project} />
          </Card>
        )}
        <p role="status" className="state-feedback">
          {feedback && (
            <>
              <Check aria-hidden="true" />
              {feedback}
            </>
          )}
        </p>
      </div>
      <StateSessionDialog
        open={signIn}
        onOpenChange={setSignIn}
        onResume={recover}
      />
    </>
  )
}
