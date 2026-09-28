import { useEffect, useRef, useState } from "react"
import { Ellipsis } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Badge } from "@/kit/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/kit/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/kit/ui/dropdown-menu"
import { VerificationForm } from "@/features/auth/verification-form"
import { RecoveryCodes } from "./recovery-codes"

type MfaAction = "setup" | "codes" | "replace" | "disable"

export function MfaSettings({
  enabled,
  codes,
  onEnable,
  onDisable,
  onReplace,
}: {
  enabled: boolean
  codes: string[]
  onEnable: (code: string) => boolean
  onDisable: () => void
  onReplace: () => void
}) {
  const [action, setAction] = useState<MfaAction | null>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (action) heading.current?.focus()
  }, [action])

  const title =
    action === "setup"
      ? "Set up two-step verification"
      : action === "disable"
        ? "Turn off two-step verification?"
        : action === "replace"
          ? "Replace recovery codes?"
          : "Recovery codes"

  return (
    <>
      <div className="security-method">
        <div>
          <div className="integration-record-heading">
            <h3>Two-step verification</h3>
            <Badge variant="secondary">{enabled ? "Enabled" : "Off"}</Badge>
          </div>
          <p className="settings-note">
            Authenticator code after signing in with any method.
          </p>
        </div>
        {enabled ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              ref={trigger}
              render={<Button variant="ghost" size="icon-sm" />}
              aria-label="Two-step verification options"
            >
              <Ellipsis />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setAction("codes")}>
                  Recovery codes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setAction("disable")}>
                  Turn off
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            ref={trigger}
            variant="outline"
            onClick={() => setAction("setup")}
          >
            Set up
          </Button>
        )}
      </div>
      <Dialog
        open={action !== null}
        onOpenChange={(open) => {
          if (!open) setAction(null)
        }}
      >
        <DialogContent
          className="settings-dialog security-dialog"
          finalFocus={trigger}
          initialFocus={heading}
        >
          <DialogHeader>
            <DialogTitle ref={heading} tabIndex={-1}>
              {title}
            </DialogTitle>
            <DialogDescription>
              {action === "setup"
                ? "Confirm the sample code to enable this demo sign-in step."
                : action === "disable"
                  ? "Sign-in will no longer ask for a code. Your recovery codes will be removed."
                  : action === "replace"
                    ? "Your existing recovery codes will stop working. Save the replacement codes."
                    : "Save these demo codes for when you cannot use an authenticator. Each code works once; reload clears them."}
            </DialogDescription>
          </DialogHeader>
          {action === "setup" && (
            <VerificationForm
              submitLabel="Enable verification"
              onVerify={(code) => {
                if (!onEnable(code)) return false
                setAction("codes")

                return true
              }}
            />
          )}
          {action === "codes" && (
            <RecoveryCodes key={codes.join()} codes={codes} />
          )}
          {action !== "setup" && (
            <DialogFooter>
              {action === "codes" ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setAction("replace")}
                  >
                    Replace codes
                  </Button>
                  <DialogClose render={<Button />}>Done</DialogClose>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setAction(action === "replace" ? "codes" : null)
                    }
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (action === "replace") {
                        onReplace()
                        setAction("codes")
                      } else {
                        onDisable()
                        setAction(null)
                      }
                    }}
                  >
                    {action === "replace" ? "Replace codes" : "Turn off"}
                  </Button>
                </>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
