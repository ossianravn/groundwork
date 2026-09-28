import { useId, useRef, useState } from "react"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { Button } from "@/kit/ui/button"
import { Field, FieldLabel, FieldDescription, FieldError } from "@/kit/ui/field"
import { Input } from "@/kit/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/kit/ui/input-otp"
import { demoVerificationCode, type VerificationMethod } from "@/demo/security"

export function VerificationForm({
  onVerify,
  submitLabel = "Verify",
  allowRecovery = false,
}: {
  onVerify: (code: string, method: VerificationMethod) => boolean
  submitLabel?: string
  allowRecovery?: boolean
}) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const [method, setMethod] = useState<VerificationMethod>("authenticator")
  const [code, setCode] = useState("")
  const [error, setError] = useState("")

  function changeCode(value: string) {
    setCode(value)
    setError("")
  }

  return (
    <form
      className="verification-form"
      onSubmit={(event) => {
        event.preventDefault()

        if (onVerify(code, method)) return
        setError(
          method === "recovery"
            ? "This recovery code is unavailable. Try an unused code or your authenticator."
            : `Code not recognized. Use ${demoVerificationCode} in this demo.`,
        )
        input.current?.focus()
      }}
    >
      <Field data-invalid={!!error}>
        <FieldLabel htmlFor={id}>
          {method === "recovery" ? "Recovery code" : "Verification code"}
        </FieldLabel>
        {method === "authenticator" ? (
          <InputOTP
            id={id}
            ref={input}
            value={code}
            onChange={changeCode}
            name="verification-code"
            maxLength={6}
            minLength={6}
            required
            pattern={REGEXP_ONLY_DIGITS}
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-invalid={!!error}
            aria-describedby={`${id}-hint ${error ? `${id}-error` : ""}`}
            pasteTransformer={(value) => value.replace(/[\s-]/gu, "")}
          >
            <InputOTPGroup>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <InputOTPSlot
                  key={index}
                  index={index}
                  aria-invalid={!!error}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        ) : (
          <Input
            id={id}
            ref={input}
            className="recovery-code-input"
            name="recovery-code"
            value={code}
            onChange={(event) => changeCode(event.target.value)}
            required
            autoComplete="off"
            spellCheck={false}
            autoCapitalize="characters"
            aria-invalid={!!error}
            aria-describedby={`${id}-hint ${error ? `${id}-error` : ""}`}
          />
        )}
        <FieldDescription id={`${id}-hint`}>
          {method === "recovery" ? (
            "Each saved recovery code works once."
          ) : (
            <>
              Demo code: <code>{demoVerificationCode}</code>. No authenticator
              app needed.
            </>
          )}
        </FieldDescription>
        {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
      </Field>
      <Button type="submit">{submitLabel}</Button>
      {allowRecovery && (
        <Button
          type="button"
          variant="ghost"
          className="access-alternative"
          onClick={() => {
            setMethod(method === "authenticator" ? "recovery" : "authenticator")
            changeCode("")
          }}
        >
          {method === "authenticator"
            ? "Use a recovery code"
            : "Use an authenticator code"}
        </Button>
      )}
    </form>
  )
}
