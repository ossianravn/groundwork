import type { ComponentProps } from "react"
import { useNavigate } from "@tanstack/react-router"

/**
 * Links in replies: workspace paths use the router, others open normally.
 * A project opened from a reply offers Back to assistant.
 */
export function ReplyLink({
  href: path,
  onClick,
  ...props
}: ComponentProps<"a">) {
  const navigate = useNavigate()

  const href = path?.startsWith("/app/demo/projects/")
    ? `${path}?returnTo=${encodeURIComponent("/app/demo/assistant")}`
    : path

  return (
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event)

        if (
          event.defaultPrevented ||
          !href?.startsWith("/") ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return

        event.preventDefault()
        void navigate({ href })
      }}
      {...props}
    />
  )
}
