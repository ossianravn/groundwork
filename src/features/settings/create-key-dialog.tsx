import { useRef, useState } from "react"
import { Copy, Plus, Check } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Input } from "@/kit/ui/input"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/kit/ui/field"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/kit/ui/dialog"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/kit/ui/select"
import { keyAccess } from "@/demo/integrations"

export function CreateKeyDialog({
  onCreate,
}: {
  onCreate: (name: string, access: string) => string
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [access, setAccess] = useState(keyAccess[0])
  const [secret, setSecret] = useState("")
  const [error, setError] = useState("")

  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  )

  const nameInput = useRef<HTMLInputElement>(null)
  const secretInput = useRef<HTMLInputElement>(null)
  const resultTitle = useRef<HTMLHeadingElement>(null)

  async function copy() {
    try {
      await navigator.clipboard.writeText(secret)
      setCopyState("copied")
    } catch {
      setCopyState("failed")
      secretInput.current?.focus()
      secretInput.current?.select()
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        setSecret("")
        setName("")
        setAccess(keyAccess[0])
        setError("")
        setCopyState("idle")
      }}
    >
      <DialogTrigger render={<Button />}>
        <Plus data-icon="inline-start" />
        Create key
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader showCloseButton>
          <DialogTitle ref={resultTitle} tabIndex={-1}>
            {secret ? "Copy your demo key" : "Create API key"}
          </DialogTitle>
          <DialogDescription>
            {secret
              ? "This nonfunctional key is shown only once. Copy it before closing."
              : "Creates a nonfunctional key for this demo session."}
          </DialogDescription>
        </DialogHeader>
        {secret ? (
          <>
            <Field>
              <FieldLabel htmlFor="created-key">Demo key</FieldLabel>
              <Input
                id="created-key"
                ref={secretInput}
                value={secret}
                readOnly
                className="font-mono"
                onFocus={(event) => event.target.select()}
              />
            </Field>
            {copyState === "failed" && (
              <p role="alert" className="settings-error">
                Copy was blocked. The key is selected; copy it manually.
              </p>
            )}
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Done
              </DialogClose>
              <Button onClick={() => void copy()}>
                {copyState === "copied" ? (
                  <Check data-icon="inline-start" />
                ) : (
                  <Copy data-icon="inline-start" />
                )}
                {copyState === "copied" ? "Copied" : "Copy key"}
              </Button>
            </DialogFooter>
            <span role="status" className="sr-only">
              {copyState === "copied" ? "Key copied." : ""}
            </span>
          </>
        ) : (
          <form
            className="settings-form"
            noValidate
            onSubmit={(event) => {
              event.preventDefault()

              if (!name.trim()) {
                setError("Enter a name.")
                nameInput.current?.focus()

                return
              }

              setSecret(onCreate(name, access))
              requestAnimationFrame(() => resultTitle.current?.focus())
            }}
          >
            <FieldGroup>
              <Field data-invalid={!!error}>
                <FieldLabel htmlFor="key-name">Name</FieldLabel>
                <Input
                  id="key-name"
                  ref={nameInput}
                  required
                  value={name}
                  placeholder="e.g. Reporting"
                  onChange={(event) => {
                    setName(event.target.value)
                    setError("")
                  }}
                  aria-invalid={!!error}
                  aria-describedby={error ? "key-error" : undefined}
                />
                {error && <FieldError id="key-error">{error}</FieldError>}
              </Field>
              <Field>
                <FieldLabel htmlFor="key-access">Access</FieldLabel>
                <Select
                  value={access}
                  onValueChange={(value) => {
                    if (value) setAccess(value)
                  }}
                >
                  <SelectTrigger id="key-access">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {keyAccess.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit">Create key</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
