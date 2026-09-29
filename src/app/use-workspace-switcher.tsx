import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "@/kit/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/kit/ui/dialog"
import type { WorkspaceSwitcherOptions } from "@/kit/shell/workspace-switcher"
import workspaceData from "@/demo/data/workspace.json"
import { useDemoState } from "./demo-state"
import { accessReturnTo } from "./access-search"

const sampleId = "studio-north"

/**
 * The demo holds one workspace at a time: the Studio North sample, or one
 * created through onboarding. Switching back to the sample discards the
 * created one, so it asks first.
 */
export function useWorkspaceSwitcher(onReset: () => void) {
  const { demo, access } = useDemoState()
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState(false)
  const created = access.onboarding.step === "complete"

  const options: WorkspaceSwitcherOptions = {
    workspaces: [
      {
        id: created ? "created" : sampleId,
        name: demo.workspace.name,
        detail: demo.workspace.plan,
        current: true,
      },
      ...(created
        ? [
            {
              id: sampleId,
              name: workspaceData.name,
              detail: "Sample workspace",
              current: false,
            },
          ]
        : []),
    ],
    onSelect: (id) => {
      if (id === sampleId) setConfirming(true)
    },
    onCreate: () =>
      void navigate({
        to: "/auth/sign-up",
        search: { returnTo: accessReturnTo(""), token: "" },
      }),
  }

  const dialog = (
    <Dialog open={confirming} onOpenChange={setConfirming}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Switch to {workspaceData.name}?</DialogTitle>
          <DialogDescription>
            The demo keeps one workspace at a time. Switching restores the{" "}
            {workspaceData.name} sample and discards {demo.workspace.name} and
            its changes.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirming(false)}>
            Stay in {demo.workspace.name}
          </Button>
          <Button
            onClick={() => {
              setConfirming(false)
              onReset()
              void navigate({
                to: "/app/demo/overview",
                search: { period: 14 },
              })
            }}
          >
            Switch workspace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return { options, dialog }
}
