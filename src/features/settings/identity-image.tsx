import { useEffect, useRef, useState } from "react"
import { Button } from "@/kit/ui/button"
import { MemberAvatar } from "@/kit/member-avatar"
import { profileInitials } from "@/demo/use-account"

export function IdentityImage({
  name,
  value,
  label,
  onChange,
}: {
  name: string
  value: string
  label: "photo" | "logo"
  onChange: (avatar: string) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const request = useRef(0)
  const [error, setError] = useState("")

  useEffect(
    () => () => {
      request.current += 1
    },
    [],
  )

  async function choosePhoto(file: File) {
    const id = ++request.current
    setError("")

    try {
      const source = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () =>
          // oxlint-disable-next-line anti-slop/no-runtime-typeof -- Parse FileReader's string/ArrayBuffer/null result at the browser I/O boundary.
          typeof reader.result === "string"
            ? resolve(reader.result)
            : reject(new Error("Image could not be read"))
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(file)
      })

      const image = new Image()
      image.src = source
      await image.decode()

      if (id === request.current) onChange(source)
    } catch {
      if (id === request.current)
        setError("This image could not be opened. Choose another image.")
    }
  }

  return (
    <div>
      <div className="settings-photo">
        <MemberAvatar
          size="lg"
          member={{
            name: name || label,
            initials: profileInitials(name),
            avatar: value,
          }}
        />
        <input
          ref={input}
          type="file"
          accept="image/*"
          aria-label={`Choose ${label}`}
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            const file = event.target.files?.[0]

            if (file) void choosePhoto(file)
            event.target.value = ""
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => input.current?.click()}
        >
          Change {label}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              request.current += 1
              setError("")
              onChange("")
            }}
          >
            Remove
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="settings-error">
          {error}
        </p>
      )}
    </div>
  )
}
